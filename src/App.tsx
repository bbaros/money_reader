import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { EmailInputPage, EmailReaderPage } from './components';
import { useEmailData } from './hooks/useEmailData';

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

    const handleEmailParsed = () => {
        setCurrentPage('reader');
    };

    const handleBackToInput = () => {
        setCurrentPage('input');
        clearEmailData();
    };

    // Updated to match the new signature in EmailMainContent and to handle closing via Popover
    const handleFootnoteClick = (footnoteId: number, currentTarget: HTMLElement | null) => {
        // If currentTarget is null, it means the Popover is closing, so deactivate the footnote.
        if (currentTarget === null) {
            setActiveFootnote(null);
            return;
        }

        // If clicking the same footnote reference and it's already active,
        // or if a different footnote is clicked, set it to active.
        // The popover closing will handle deactivation if user clicks away.
        if (activeFootnoteId === footnoteId) {
            // This case might be tricky: if they click the same link, should it close or stay open?
            // Current Popover logic in EmailMainContent will try to re-open it.
            // For now, let's assume clicking an active link should keep it active,
            // and closing happens via popover's onClose or clicking another link.
            // If the desire is to toggle by clicking the same link, EmailMainContent's setPopoverAnchorEl(null)
            // logic would need to be coordinated with setActiveFootnote(null) here.
            // The Popover's own onClose handles setting anchor to null.
            // Re-clicking the same active footnote ref will re-anchor the popover.
            // If the popover is closed (e.g. by clicking away) and then the same footnote is clicked again,
            // this will simply re-activate it and the popover will show.
            setActiveFootnote(footnoteId);
        } else {
            setActiveFootnote(footnoteId);
        }
        // The anchor element management is now fully within EmailMainContent.tsx
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