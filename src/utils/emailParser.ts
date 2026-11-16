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
    let cleanHtml = html;

    cleanHtml = cleanHtml.replace(/style\s*=\s*"[^"]*"/gi, '');
    cleanHtml = cleanHtml.replace(/class\s*=\s*"[^"]*"/gi, '');
    cleanHtml = cleanHtml.replace(/<o:p[^>]*>.*?<\/o:p>/gi, '');
    cleanHtml = cleanHtml.replace(/<span[^>]*><\/span>/gi, '');

    // Normalize linked footnote references, including Gmail-prefixed anchors.
    cleanHtml = cleanHtml.replace(
        /<a\b([^>]*?)href\s*=\s*(["'])[^"']*footnote[-_]?\d+[^"']*\2([^>]*)>(.*?)<\/a>/gi,
        (match, beforeHref, _quote, afterHref, linkText) => {
            const href = match.match(/href\s*=\s*(["'])[^"']*footnote[-_]?\d+[^"']*\1/i)?.[0] || '';
            const id = href.match(/footnote[-_]?(\d+)/i)?.[1];
            if (!id) return match;
            return `<a${beforeHref}href="#footnote-${id}"${afterHref} class="footnote-link" data-footnote-id="${id}">${linkText}</a>`;
        }
    );

    // Also link plain <sup>[1]</sup> references, without nesting existing anchors.
    cleanHtml = cleanHtml.replace(
        /<sup\b[^>]*>\s*\[(\d+)\]\s*<\/sup>/gi,
        (match, id: string, offset: number, source: string) => {
            const precedingHtml = source.slice(0, offset);
            if (precedingHtml.lastIndexOf('<a') > precedingHtml.lastIndexOf('</a>')) {
                return match;
            }
            return `<a href="#footnote-${id}" class="footnote-link" data-footnote-id="${id}">[${id}]</a>`;
        }
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

const subscriptionDelimiter = /If\s+you(?:’|&#8217;|&rsquo;|'|&#39;)d\s+like\s+to\s+get\s+Money\s+Stuff/i;

/** Locate a keyed footnote or a paragraph/div whose text begins with a numbered note. */
function findFirstFootnoteMatch(html: string): number {
    const footnoteDefinition = /<(?:div\b[^>]*\bid\s*=\s*["'][^"']*footnote[-_]?\d+|a\b[^>]*\bname\s*=\s*["'][^"']*footnote[-_]?\d+|(?:p|div)\b[^>]*>\s*(?:(?:<[^>]*>)\s*)*\[\d+\]\s+)/i;
    return html.search(footnoteDefinition);
}

export const parseMatthewLevineEmail = (htmlContent: string): ParsedEmail => {
    if (!htmlContent || htmlContent.trim().length === 0) {
        throw new EmailParseError('Email content is empty');
    }

    const isHtml = /<[a-z][\s\S]*>/i.test(htmlContent);
    let contentToProcess = isHtml ? extractNewsletterBody(htmlContent) : htmlContent;
    contentToProcess = removeEmailFooter(contentToProcess);

    let mainContent = '';
    let footnotesSection = '';

    if (isHtml) {
        const textContent = stripHtmlTags(contentToProcess);
        const textDelimiterMatch = textContent.search(subscriptionDelimiter);
        let delimiterMatch = -1;

        if (textDelimiterMatch !== -1) {
            const delimiterText = textContent.substring(textDelimiterMatch, textDelimiterMatch + 50);
            const delimiterWords = delimiterText.split(/\s+/).slice(0, 6).join('\\s+');
            const htmlDelimiterPattern = new RegExp(
                delimiterWords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'i'
            );
            delimiterMatch = contentToProcess.search(htmlDelimiterPattern);
            if (delimiterMatch === -1) {
                delimiterMatch = contentToProcess.search(subscriptionDelimiter);
            }
        }

        const firstFootnoteMatch = findFirstFootnoteMatch(contentToProcess);
        if (firstFootnoteMatch !== -1 && (delimiterMatch === -1 || firstFootnoteMatch < delimiterMatch)) {
            mainContent = contentToProcess.substring(0, firstFootnoteMatch).trim();
            footnotesSection = contentToProcess.substring(firstFootnoteMatch).trim();
        } else if (delimiterMatch !== -1) {
            mainContent = contentToProcess.substring(0, delimiterMatch).trim();
            footnotesSection = contentToProcess.substring(delimiterMatch).trim();
        } else {
            return parseGenericFootnotes(contentToProcess);
        }

        mainContent = convertHtmlToDisplayHtml(mainContent);
    } else {
        const delimiterMatch = contentToProcess.search(subscriptionDelimiter);
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
    const firstFootnoteMatch = findFirstFootnoteMatch(htmlContent);
    let mainContent = '';
    let footnotesSection = '';

    if (firstFootnoteMatch !== -1) {
        mainContent = htmlContent.substring(0, firstFootnoteMatch).trim();
        footnotesSection = htmlContent.substring(firstFootnoteMatch).trim();
    } else {
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

        if (separatorMatch !== -1) {
            mainContent = htmlContent.substring(0, separatorMatch).trim();
            footnotesSection = htmlContent.substring(separatorMatch + separatorLength).trim();
        } else {
            mainContent = htmlContent;
        }
    }

    const footnotes = extractGenericFootnotes(footnotesSection);
    mainContent = convertHtmlToDisplayHtml(mainContent);
    return { mainContent, footnotes };
};

/** Extract Bloomberg footnotes from ids, named anchors, and plain numbered paragraphs. */
function extractBloombergFootnotes(footnotesSection: string): Footnote[] {
    if (!footnotesSection || typeof document === 'undefined') {
        return [];
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = footnotesSection;
    const footnotes: Footnote[] = [];
    const foundIds = new Set<number>();

    const addFootnote = (idValue: string, htmlContent: string) => {
        const idMatch = idValue.match(/footnote[-_]?(\d+)/i) || idValue.match(/^\[(\d+)\]/);
        if (!idMatch) return;

        const id = parseInt(idMatch[1], 10);
        const content = stripHtmlTags(htmlContent).trim();
        if (content && !foundIds.has(id)) {
            foundIds.add(id);
            footnotes.push({ id, content, originalHtml: htmlContent });
        }
    };

    tempDiv.querySelectorAll('div[id*="footnote"]').forEach(div => {
        addFootnote(div.id, div.innerHTML);
    });

    tempDiv.querySelectorAll('a[name*="footnote"]').forEach(anchor => {
        if (anchor.closest('div[id*="footnote"]')) return;
        const container = anchor.closest('p, div, li') || anchor.parentElement;
        if (container) addFootnote(anchor.getAttribute('name') || '', container.innerHTML);
    });

    // Bloomberg's newer format has no identifying attributes; capture numbered note blocks.
    tempDiv.querySelectorAll('p, div').forEach(element => {
        const text = (element.textContent || '').trim();
        const match = text.match(/^\[(\d+)\]\s+/);
        if (match && !foundIds.has(parseInt(match[1], 10))) {
            addFootnote(match[0], element.innerHTML);
        }
    });

    return footnotes.sort((a, b) => a.id - b.id);
}

const extractGenericFootnotes = (footnotesSection: string): Footnote[] =>
    extractBloombergFootnotes(footnotesSection);

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
