import { useState, useCallback } from 'react';
import { EmailParserState } from '../utils/types';
import { parseMatthewLevineEmail, EmailParseError } from '../utils/emailParser';

export const useEmailData = () => {
    const [state, setState] = useState<EmailParserState>({
        rawHtml: '',
        parsedEmail: null,
        isLoading: false,
        error: null
    });

    const [activeFootnoteId, setActiveFootnoteId] = useState<number | null>(null);

    const parseEmail = useCallback(async (htmlContent: string) => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null
        }));

        try {
            // Add a small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 500));

            const parsedEmail = parseMatthewLevineEmail(htmlContent);

            setState(prev => ({
                ...prev,
                rawHtml: htmlContent,
                parsedEmail,
                isLoading: false,
                error: null
            }));

            return parsedEmail;
        } catch (error) {
            const errorMessage = error instanceof EmailParseError
                ? error.message
                : 'An unexpected error occurred while parsing the email';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }));

            throw error;
        }
    }, []);

    const clearEmailData = useCallback(() => {
        setState({
            rawHtml: '',
            parsedEmail: null,
            isLoading: false,
            error: null
        });
        setActiveFootnoteId(null);
    }, []);

    const setActiveFootnote = useCallback((footnoteId: number | null) => {
        setActiveFootnoteId(footnoteId);
    }, []);

    return {
        ...state,
        activeFootnoteId,
        parseEmail,
        clearEmailData,
        setActiveFootnote
    };
};