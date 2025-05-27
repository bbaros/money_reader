export interface ParsedEmail {
    mainContent: string;
    footnotes: Footnote[];
}

export interface Footnote {
    id: number;
    content: string;
    originalHtml?: string;
}

export interface EmailParserState {
    rawHtml: string;
    parsedEmail: ParsedEmail | null;
    isLoading: boolean;
    error: string | null;
}

export interface AppState {
    currentPage: 'input' | 'reader';
    emailData: ParsedEmail | null;
    activeFootnoteId: number | null;
}