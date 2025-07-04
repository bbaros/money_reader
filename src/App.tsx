import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material/styles';
import { CssBaseline, Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { EmailInputPage, EmailReaderPage } from './components';
import { useEmailData } from './hooks/useEmailData';

const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // palette values for light mode
                primary: {
                    main: '#1976d2',
                },
                secondary: {
                    main: '#dc004e',
                },
                background: {
                    default: '#f5f5f5',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#000000',
                    secondary: '#5f6368',
                }
            }
            : {
                // palette values for dark mode
                primary: {
                    main: '#90caf9', // A lighter blue for dark mode
                },
                secondary: {
                    main: '#f48fb1', // A lighter pink for dark mode
                },
                background: {
                    default: '#121212',
                    paper: '#1e1e1e', // Slightly lighter than default for paper elements
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#aaaaaa',
                }
            }),
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
    const [mode, setMode] = useState<PaletteMode>('light');
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

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
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                color: 'text.primary', // Ensure text color contrasts with background
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{ alignSelf: 'flex-end', p: 1 }}>
                    <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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