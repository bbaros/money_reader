import { ParsedEmail, Footnote } from './types';

export class EmailParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EmailParseError';
    }
}

function stripHtmlTags(html: string): string {
    if (typeof document === 'undefined') {
        return html.replace(/<[^>]*>/g, '');
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

function convertHtmlToDisplayHtml(html: string): string {
    // Keep essential HTML structure but clean up email-specific elements
    let cleanHtml = html;

    cleanHtml = cleanHtml.replace(/style\s*=\s*"[^"]*"/gi, '');
    cleanHtml = cleanHtml.replace(/class\s*=\s*"[^"]*"/gi, '');
    cleanHtml = cleanHtml.replace(/<o:p[^>]*>.*?<\/o:p>/gi, '');
    cleanHtml = cleanHtml.replace(/<span[^>]*><\/span>/gi, '');

    // Convert footnote links to internal app links, including Bloomberg's #footnote-1 links.
    cleanHtml = cleanHtml.replace(
        /<a[^>]*href\s*=\s*["'][^"']*footnote[_-]?(\d+)[^"']*["'][^>]*>(.*?)<\/a>/gi,
        (_match, footnoteNum, linkText) =>
            `<a href="#footnote-${footnoteNum}" class="footnote-link" data-footnote-id="${footnoteNum}">${linkText}</a>`
    );

    return cleanHtml;
}

function extractNewsletterBody(html: string): string {
    if (typeof document !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const wrapperTable = tempDiv.querySelector('table[id$="wrapper"]');
        if (wrapperTable) {
            return wrapperTable.outerHTML;
        }
    }
    return html;
}

/** Remove Bloomberg's footer and any trailing content from the email. */
function removeEmailFooter(html: string): string {
    const footerPatterns = [
        /You\s+received\s+this\s+message\s+because\s+you\s+are\s+subscribed\s+to\s+Bloomberg(?:’|&#8217;|&rsquo;|'|&#39;)s\s+Money\s+Stuff\s+newsletter\./i,
        /<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?\bFollow\s+Us\b(?:(?!<\/p>)[\s\S])*?<\/p>/i
    ];
    const footerPositions = footerPatterns
        .map(pattern => pattern.exec(html)?.index)
        .filter((position): position is number => position !== undefined);

    return footerPositions.length > 0
        ? html.substring(0, Math.min(...footerPositions)).trim()
        : html;
}

export const parseMatthewLevineEmail = (htmlContent: string): ParsedEmail => {
    if (!htmlContent || htmlContent.trim().length === 0) {
        throw new EmailParseError('Email content is empty');
    }

    const isHtml = /<[a-z][\s\S]*>/i.test(htmlContent);
    let contentToProcess = htmlContent;
    if (isHtml) {
        contentToProcess = extractNewsletterBody(htmlContent);
    }
    contentToProcess = removeEmailFooter(contentToProcess);

    let delimiterMatch = -1;
    let mainContent = '';
    let footnotesSection = '';

    if (isHtml) {
        const textContent = stripHtmlTags(contentToProcess);
        const delimiter = /If you'd like to get Money Stuff/i;
        const textDelimiterMatch = textContent.search(delimiter);

        if (textDelimiterMatch === -1) {
            return parseGenericFootnotes(contentToProcess);
        }

        const delimiterText = textContent.substring(textDelimiterMatch, textDelimiterMatch + 50);
        const delimiterWords = delimiterText.split(/\s+/).slice(0, 6).join('\\s+');
        const htmlDelimiterPattern = new RegExp(
            delimiterWords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'i'
        );

        delimiterMatch = contentToProcess.search(htmlDelimiterPattern);
        if (delimiterMatch === -1) {
            delimiterMatch = contentToProcess.search(delimiter);
        }

        if (delimiterMatch !== -1) {
            mainContent = contentToProcess.substring(0, delimiterMatch).trim();
            footnotesSection = contentToProcess.substring(delimiterMatch).trim();
            mainContent = convertHtmlToDisplayHtml(mainContent);
        } else {
            throw new EmailParseError(
                'Could not locate the subscription section in the HTML content.'
            );
        }
    } else {
        const delimiter = /If you'd like to get Money Stuff/i;
        delimiterMatch = contentToProcess.search(delimiter);

        if (delimiterMatch === -1) {
            return parseGenericFootnotes(contentToProcess);
        }

        mainContent = contentToProcess.substring(0, delimiterMatch).trim();
        footnotesSection = contentToProcess.substring(delimiterMatch).trim();
    }

    const footnotes = extractFootnotes(footnotesSection, isHtml);
    if (mainContent.length === 0) {
        throw new EmailParseError('No main content found before the subscription section');
    }

    return { mainContent, footnotes };
};

const parseGenericFootnotes = (htmlContent: string): ParsedEmail => {
    const footnotesSeparators = [
        /<h[1-6][^>]*>footnotes?<\/h[1-6]>/i,
        /footnotes?:/i,
        /<p[^>]*id\s*=\s*["']?footnote/i
    ];

    let separatorMatch = -1;
    let separatorLength = 0;
    for (const separator of footnotesSeparators) {
        const match = htmlContent.search(separator);
        if (match !== -1) {
            separatorMatch = match;
            separatorLength = htmlContent.match(separator)?.[0].length ?? 0;
            break;
        }
    }

    let mainContent = '';
    let footnotesSection = '';
    if (separatorMatch !== -1) {
        mainContent = htmlContent.substring(0, separatorMatch).trim();
        footnotesSection = htmlContent.substring(separatorMatch + separatorLength).trim();
    } else {
        const firstFootnoteMatch = htmlContent.search(
            /<(?:div\b[^>]*\bid\s*=\s*["'][^"']*footnote-\d+|a\b[^>]*\bname\s*=\s*["'][^"']*footnote-\d+)/i
        );

        if (firstFootnoteMatch !== -1) {
            mainContent = htmlContent.substring(0, firstFootnoteMatch).trim();
            footnotesSection = htmlContent.substring(firstFootnoteMatch).trim();
        } else {
            mainContent = htmlContent;
        }
    }

    const footnotes = extractGenericFootnotes(footnotesSection);
    mainContent = convertHtmlToDisplayHtml(mainContent);
    return { mainContent, footnotes };
};

/** Extract Bloomberg footnotes from their containing divs, with named anchors as fallback. */
function extractBloombergFootnotes(footnotesSection: string): Footnote[] {
    if (!footnotesSection || typeof document === 'undefined') {
        return [];
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = footnotesSection;
    const footnotes: Footnote[] = [];
    const foundIds = new Set<number>();

    const addFootnote = (idValue: string, htmlContent: string) => {
        const idMatch = idValue.match(/footnote-(\d+)/i);
        if (!idMatch) return;

        const id = parseInt(idMatch[1], 10);
        const content = stripHtmlTags(htmlContent).trim();
        if (content && !foundIds.has(id)) {
            foundIds.add(id);
            footnotes.push({ id, content, originalHtml: htmlContent });
        }
    };

    tempDiv.querySelectorAll('div[id*="footnote-"]').forEach(div => {
        addFootnote(div.id, div.innerHTML);
    });

    tempDiv.querySelectorAll('a[name*="footnote-"]').forEach(anchor => {
        // If the named anchor is inside a Bloomberg footnote div, that div was handled above.
        if (anchor.closest('div[id*="footnote-"]')) return;
        const container = anchor.parentElement;
        if (container) addFootnote(anchor.getAttribute('name') || '', container.innerHTML);
    });

    return footnotes.sort((a, b) => a.id - b.id);
}

const extractGenericFootnotes = (footnotesSection: string): Footnote[] => {
    return extractBloombergFootnotes(footnotesSection);
};

const extractFootnotes = (footnotesSection: string, isHtml: boolean): Footnote[] => {
    if (isHtml) {
        return extractBloombergFootnotes(footnotesSection);
    }

    const footnotes: Footnote[] = [];
    const footnoteRegex = /^\[(\d+)\]\s*(.*?)(?=^\[\d+\]|\s*$)/gms;
    let currentMatch;
    while ((currentMatch = footnoteRegex.exec(footnotesSection)) !== null) {
        const id = parseInt(currentMatch[1], 10);
        const content = currentMatch[2].trim();
        if (content) {
            footnotes.push({ id, content, originalHtml: currentMatch[0] });
        }
    }
    return footnotes.sort((a, b) => a.id - b.id);
};

export const findFootnoteReferences = (content: string): number[] => {
    const referenceRegex = /\[(\d+)\]/g;
    const references: number[] = [];

    let currentMatch;
    while ((currentMatch = referenceRegex.exec(content)) !== null) {
        const id = parseInt(currentMatch[1], 10);
        if (!references.includes(id)) {
            references.push(id);
        }
    }

    return references.sort((a, b) => a - b);
};

export const highlightFootnoteReferences = (content: string): string => {
    // The React component handles rendering the clickable footnote references.
    return content.replace(/\[(\d+)\]/g, (match, id) =>
        `<span class="footnote-ref" data-footnote-id="${id}">${match}</span>`
    );
};
