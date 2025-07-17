import { useState, useCallback, useEffect } from 'react';
import { EmailParserState, ParsedEmail } from '../utils/types';
import { parseMatthewLevineEmail, EmailParseError } from '../utils/emailParser';

const LOCAL_STORAGE_KEY = 'moneyStuffReaderState';

interface StoredState {
    rawHtml: string;
    parsedEmail: ParsedEmail | null;
}

export const useEmailData = () => {
    const [state, setState] = useState<EmailParserState>(() => {
        try {
            const storedItem = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedItem) {
                const storedState: StoredState = JSON.parse(storedItem);
                return {
                    ...storedState,
                    isLoading: false,
                    error: null,
                };
            }
        } catch (error) {
            console.error("Failed to parse state from localStorage", error);
            // If parsing fails, fall back to the default state
        }
        return {
            rawHtml: '',
            parsedEmail: null,
            isLoading: false,
            error: null,
        };
    });

    const [activeFootnoteId, setActiveFootnoteId] = useState<number | null>(null);

    // Effect to save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const stateToStore: StoredState = {
                rawHtml: state.rawHtml,
                parsedEmail: state.parsedEmail,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToStore));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [state.rawHtml, state.parsedEmail]);

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