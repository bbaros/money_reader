import { ParsedEmail, Footnote } from './types';

export class EmailParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EmailParseError';
    }
}

function stripHtmlTags(html: string): string {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

function convertHtmlToDisplayHtml(html: string): string {
    // Keep essential HTML structure but clean up email-specific elements
    let cleanHtml = html;

    // Remove email-specific styles and attributes that might interfere
    cleanHtml = cleanHtml.replace(/style\s*=\s*"[^"]*"/gi, '');
    cleanHtml = cleanHtml.replace(/class\s*=\s*"[^"]*"/gi, '');
    cleanHtml = cleanHtml.replace(/<o:p[^>]*>.*?<\/o:p>/gi, '');
    cleanHtml = cleanHtml.replace(/<span[^>]*><\/span>/gi, '');

    // Process footnote links: Convert Gmail footnote links to internal app links
    cleanHtml = cleanHtml.replace(
        /<a[^>]*href\s*=\s*["'][^"']*footnote[_-]?(\d+)["'][^>]*>(.*?)<\/a>/gi,
        (_match, footnoteNum, linkText) => {
            // Convert to internal footnote link that our app can handle
            return `<a href="#footnote-${footnoteNum}" class="footnote-link" data-footnote-id="${footnoteNum}">${linkText}</a>`;
        }
    );

    // Preserve important elements: links, bold, italic, line breaks
    return cleanHtml;
}

function extractNewsletterBody(html: string): string {
    // Check if we are in a DOM environment
    if (typeof document !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Look for the specific table structure used by Bloomberg/Money Stuff
        // The id pattern seems to be consistently 'm_...wrapper' or ending in 'wrapper'
        const wrapperTable = tempDiv.querySelector('table[id$="wrapper"]');
        if (wrapperTable) {
            return wrapperTable.outerHTML;
        }
    }
    return html;
}

export const parseMatthewLevineEmail = (htmlContent: string): ParsedEmail => {
    if (!htmlContent || htmlContent.trim().length === 0) {
        throw new EmailParseError('Email content is empty');
    }

    // Detect if content is HTML
    const isHtml = /<[a-z][\s\S]*>/i.test(htmlContent);

    // Clean wrapper if present (only for HTML)
    let contentToProcess = htmlContent;
    if (isHtml) {
        contentToProcess = extractNewsletterBody(htmlContent);
    }

    // For HTML content, we need to be smarter about delimiter detection
    let delimiterMatch = -1;
    let mainContent = '';
    let footnotesSection = '';

    if (isHtml) {
        // Strip HTML to find the delimiter in text content
        const textContent = stripHtmlTags(contentToProcess);
        const delimiter = /If you'd like to get Money Stuff/i;
        const textDelimiterMatch = textContent.search(delimiter);

        if (textDelimiterMatch === -1) {
            // Fallback: try to parse generic footnotes
            return parseGenericFootnotes(contentToProcess);
        }

        // Find the delimiter phrase in the original HTML
        // We'll look for the text content around the delimiter to locate it in HTML
        const delimiterText = textContent.substring(textDelimiterMatch, textDelimiterMatch + 50);
        const delimiterWords = delimiterText.split(/\s+/).slice(0, 6).join('\\s+'); // First 6 words
        const htmlDelimiterPattern = new RegExp(delimiterWords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        delimiterMatch = contentToProcess.search(htmlDelimiterPattern);

        if (delimiterMatch === -1) {
            // Fallback: try to find the delimiter using a more flexible approach
            const simpleDelimiter = /If you'd like to get Money Stuff/i;
            delimiterMatch = contentToProcess.search(simpleDelimiter);
        }

        if (delimiterMatch !== -1) {
            mainContent = contentToProcess.substring(0, delimiterMatch).trim();
            footnotesSection = contentToProcess.substring(delimiterMatch).trim();

            // Convert for display while preserving structure
            mainContent = convertHtmlToDisplayHtml(mainContent);
        } else {
            throw new EmailParseError(
                'Could not locate the subscription section in the HTML content.'
            );
        }
    } else {
        // For plain text, use the original logic
        const delimiter = /If you'd like to get Money Stuff/i;
        delimiterMatch = contentToProcess.search(delimiter);

        if (delimiterMatch === -1) {
            // Fallback: try to parse generic footnotes
            return parseGenericFootnotes(contentToProcess);
        }

        mainContent = contentToProcess.substring(0, delimiterMatch).trim();
        footnotesSection = contentToProcess.substring(delimiterMatch).trim();
    }

    // Extract footnotes from the footnotes section
    const footnotes = extractFootnotes(footnotesSection, isHtml);

    // Validate that we found some content
    if (mainContent.length === 0) {
        throw new EmailParseError('No main content found before the subscription section');
    }

    return {
        mainContent,
        footnotes
    };
};

const parseGenericFootnotes = (htmlContent: string): ParsedEmail => {
    // Try to find a common footnotes separator (like <hr>, "Footnotes", etc.)
    const footnotesSeparators = [
        /<hr[^>]*>/i,
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
            const matchResult = htmlContent.match(separator);
            separatorLength = matchResult ? matchResult[0].length : 0;
            break;
        }
    }

    let mainContent = '';
    let footnotesSection = '';

    if (separatorMatch !== -1) {
        // Found a separator, split content
        mainContent = htmlContent.substring(0, separatorMatch).trim();
        footnotesSection = htmlContent.substring(separatorMatch + separatorLength).trim();
    } else {
        // No separator found, look for footnote patterns in the content
        // Check if there are footnote references [1], [2], etc. and footnote definitions
        const hasFootnoteRefs = /\[(\d+)\]/.test(stripHtmlTags(htmlContent));

        // Look for both generic footnote patterns and Matt Levine specific patterns
        const hasGenericFootnoteDefs = /<[^>]*id\s*=\s*["']?footnote\d+/i.test(htmlContent);
        const hasMattLevineFootnoteDefs = /<[^>]*id\s*=\s*["'][^"']*footnote[_-]?\d+["']/i.test(htmlContent);

        const hasFootnoteDefs = hasGenericFootnoteDefs || hasMattLevineFootnoteDefs;

        if (hasFootnoteRefs && hasFootnoteDefs) {
            // Find the first footnote definition to split content
            let firstFootnoteMatch = htmlContent.search(/<[^>]*id\s*=\s*["']?footnote\d+/i);

            // If generic pattern not found, try Matt Levine pattern
            if (firstFootnoteMatch === -1) {
                firstFootnoteMatch = htmlContent.search(/<[^>]*id\s*=\s*["'][^"']*footnote[_-]?\d+["']/i);
            }

            if (firstFootnoteMatch !== -1) {
                mainContent = htmlContent.substring(0, firstFootnoteMatch).trim();
                footnotesSection = htmlContent.substring(firstFootnoteMatch).trim();
            } else {
                // All content is main content, no footnotes
                mainContent = convertHtmlToDisplayHtml(htmlContent);
                footnotesSection = '';
            }
        } else {
            // All content is main content, no footnotes
            mainContent = convertHtmlToDisplayHtml(htmlContent);
            footnotesSection = '';
        }
    }

    // Extract footnotes from the footnotes section
    const footnotes = extractGenericFootnotes(footnotesSection);

    // Clean up main content
    mainContent = convertHtmlToDisplayHtml(mainContent);

    return {
        mainContent,
        footnotes
    };
};

const extractGenericFootnotes = (footnotesSection: string): Footnote[] => {
    const footnotes: Footnote[] = [];

    if (!footnotesSection) {
        return footnotes;
    }

    // Pattern 1: Matt Levine specific - <div id="m_2112239859843597646footnote-1" style="font-style: italic;">
    const mattLevineFootnoteRegex = /<div[^>]*id\s*=\s*["'][^"']*footnote-(\d+)["'][^>]*>(.*?)<\/div>/gis;
    let currentMatch;
    while ((currentMatch = mattLevineFootnoteRegex.exec(footnotesSection)) !== null) {
        const id = parseInt(currentMatch[1], 10);
        const htmlContent = currentMatch[2];
        const content = stripHtmlTags(htmlContent).trim();

        if (content.length > 0) {
            footnotes.push({
                id,
                content,
                originalHtml: htmlContent // Store the inner HTML for display
            });
        }
    }

    // Pattern 2: Alternative Matt Levine pattern - without the hyphen
    if (footnotes.length === 0) {
        const altMattLevineRegex = /<div[^>]*id\s*=\s*["'][^"']*footnote(\d+)["'][^>]*>(.*?)<\/div>/gis;
        while ((currentMatch = altMattLevineRegex.exec(footnotesSection)) !== null) {
            const id = parseInt(currentMatch[1], 10);
            const htmlContent = currentMatch[2];
            const content = stripHtmlTags(htmlContent).trim();

            if (content.length > 0) {
                footnotes.push({
                    id,
                    content,
                    originalHtml: htmlContent
                });
            }
        }
    }

    // Pattern 3: Generic HTML footnotes with IDs like <p id="footnote1">
    if (footnotes.length === 0) {
        const htmlFootnoteRegex = /<p[^>]*id\s*=\s*["']?footnote(\d+)["']?[^>]*>(.*?)<\/p>/gis;
        while ((currentMatch = htmlFootnoteRegex.exec(footnotesSection)) !== null) {
            const id = parseInt(currentMatch[1], 10);
            const htmlContent = currentMatch[2];
            const content = stripHtmlTags(htmlContent).trim();

            if (content.length > 0) {
                footnotes.push({
                    id,
                    content,
                    originalHtml: currentMatch[0]
                });
            }
        }
    }

    // Pattern 4: Simple numbered paragraphs like <p><sup>1</sup> content</p>
    if (footnotes.length === 0) {
        const supFootnoteRegex = /<p[^>]*><sup>(\d+)<\/sup>\s*(.*?)<\/p>/gis;
        while ((currentMatch = supFootnoteRegex.exec(footnotesSection)) !== null) {
            const id = parseInt(currentMatch[1], 10);
            const htmlContent = currentMatch[2];
            const content = stripHtmlTags(htmlContent).trim();

            if (content.length > 0) {
                footnotes.push({
                    id,
                    content,
                    originalHtml: currentMatch[0]
                });
            }
        }
    }

    // Sort footnotes by id to ensure proper order
    footnotes.sort((a, b) => a.id - b.id);

    return footnotes;
};

const extractFootnotes = (footnotesSection: string, isHtml: boolean): Footnote[] => {
    const footnotes: Footnote[] = [];

    if (isHtml) {
        // For HTML, look for footnotes in both the text and HTML structure
        const textContent = stripHtmlTags(footnotesSection);

        // Pattern 1: Matt Levine specific - Look for the exact pattern from real emails
        // <div id="m_2112239859843597646footnote-1" style="font-style: italic;">
        const mattLevineFootnoteRegex = /<div[^>]*id\s*=\s*["'][^"']*footnote-(\d+)["'][^>]*>(.*?)<\/div>/gis;
        let currentMatch;
        while ((currentMatch = mattLevineFootnoteRegex.exec(footnotesSection)) !== null) {
            const id = parseInt(currentMatch[1], 10);
            const htmlContent = currentMatch[2];
            const content = stripHtmlTags(htmlContent).trim();

            if (content.length > 0) {
                footnotes.push({
                    id,
                    content,
                    originalHtml: htmlContent // Store the inner HTML for display
                });
            }
        }

        // Pattern 2: Alternative Matt Levine pattern - without the hyphen
        if (footnotes.length === 0) {
            const altMattLevineRegex = /<div[^>]*id\s*=\s*["'][^"']*footnote(\d+)["'][^>]*>(.*?)<\/div>/gis;
            while ((currentMatch = altMattLevineRegex.exec(footnotesSection)) !== null) {
                const id = parseInt(currentMatch[1], 10);
                const htmlContent = currentMatch[2];
                const content = stripHtmlTags(htmlContent).trim();

                if (content.length > 0) {
                    footnotes.push({
                        id,
                        content,
                        originalHtml: htmlContent
                    });
                }
            }
        }

        // Pattern 3: Generic HTML footnotes with IDs like <div id="footnote-1">
        if (footnotes.length === 0) {
            const htmlFootnoteRegex = /<[^>]*id\s*=\s*["']?[^"']*footnote[^"']*(\d+)[^"']*["']?[^>]*>(.*?)<\/[^>]+>/gis;
            while ((currentMatch = htmlFootnoteRegex.exec(footnotesSection)) !== null) {
                const id = parseInt(currentMatch[1], 10);
                const htmlContent = currentMatch[2];
                const content = stripHtmlTags(htmlContent).trim();

                if (content.length > 0) {
                    footnotes.push({
                        id,
                        content,
                        originalHtml: currentMatch[0]
                    });
                }
            }
        }

        // Pattern 4: Text-based footnotes in HTML content
        if (footnotes.length === 0) {
            const footnoteRegex = /\[(\d+)\]\s*(.*?)(?=\[\d+\]|$)/gs;
            while ((currentMatch = footnoteRegex.exec(textContent)) !== null) {
                const id = parseInt(currentMatch[1], 10);
                const content = currentMatch[2].trim();

                if (content.length > 0) {
                    footnotes.push({
                        id,
                        content,
                        originalHtml: currentMatch[0]
                    });
                }
            }
        }
    } else {
        // For plain text, use the original logic
        const footnoteRegex = /^\[(\d+)\]\s*(.*?)(?=^\[\d+\]|\s*$)/gms;
        let currentMatch;
        while ((currentMatch = footnoteRegex.exec(footnotesSection)) !== null) {
            const id = parseInt(currentMatch[1], 10);
            const content = currentMatch[2].trim();

            if (content.length > 0) {
                footnotes.push({
                    id,
                    content,
                    originalHtml: currentMatch[0]
                });
            }
        }
    }

    // Sort footnotes by id to ensure proper order
    footnotes.sort((a, b) => a.id - b.id);

    return footnotes;
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

export const highlightFootnoteReferences = (
    content: string
): string => {
    // This function will be used to replace footnote references with clickable elements
    // We'll implement the actual highlighting in the React component
    return content.replace(/\[(\d+)\]/g, (match, id) => {
        return `<span class="footnote-ref" data-footnote-id="${id}">${match}</span>`;
    });
};