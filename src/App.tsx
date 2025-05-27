import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { EmailInputPage, EmailReaderPage } from './components';
import { useEmailData } from './hooks/useEmailData';
import { ParsedEmail } from './utils/types';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

function App() {
    const [currentPage, setCurrentPage] = useState<'input' | 'reader'>('input');
    const {
        parsedEmail,
        isLoading,
        error,
        activeFootnoteId,
        parseEmail,
        clearEmailData,
        setActiveFootnote
    } = useEmailData();

    const handleEmailParsed = (email: ParsedEmail) => {
        setCurrentPage('reader');
    };

    const handleBackToInput = () => {
        setCurrentPage('input');
        clearEmailData();
    };

    const handleFootnoteClick = (footnoteId: number) => {
        // If clicking the same footnote, deselect it
        if (activeFootnoteId === footnoteId) {
            setActiveFootnote(null);
        } else {
            setActiveFootnote(footnoteId);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
                {currentPage === 'input' ? (
                    <EmailInputPage
                        onEmailParsed={handleEmailParsed}
                        isLoading={isLoading}
                        error={error}
                        onParseEmail={parseEmail}
                    />
                ) : (
                    parsedEmail && (
                        <EmailReaderPage
                            parsedEmail={parsedEmail}
                            activeFootnoteId={activeFootnoteId}
                            onFootnoteClick={handleFootnoteClick}
                            onBackToInput={handleBackToInput}
                        />
                    )
                )}
            </Box>
        </ThemeProvider>
    );
}

export default App;