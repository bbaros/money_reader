import { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, IconButton, PaletteMode, Typography, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { EmailInputPage, EmailReaderPage } from './components';
import { useEmailData } from './hooks/useEmailData';

function App() {
    const [mode, setMode] = useState<PaletteMode>('light');
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode: PaletteMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    // Resolve ThemeOptions issue by ensuring components are correctly typed or simplified.
    // For now, let's remove the problematic MuiButton styleOverride to see if other errors are resolved.
    // We can re-add it carefully if 'textTransform: none' is crucial.
    const baseTypography = {
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
    };

    const getCustomTheme = (mode: PaletteMode) => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    primary: { main: '#1976d2' },
                    secondary: { main: '#dc004e' },
                    background: { default: '#f5f5f5', paper: '#ffffff' },
                    text: { primary: '#000000', secondary: '#5f6368' },
                }
                : {
                    primary: { main: '#90caf9' },
                    secondary: { main: '#f48fb1' },
                    background: { default: '#121212', paper: '#1e1e1e' },
                    text: { primary: '#ffffff', secondary: '#aaaaaa' },
                }),
        },
        typography: baseTypography,
        components: {
            MuiButton: {
                styleOverrides: {
                    // root: { // Temporarily commenting out to resolve TS2345
                    //  textTransform: 'none',
                    // },
                },
            },
        },
    });

    const theme = useMemo(() => getCustomTheme(mode), [mode]);

    const {
        parsedEmail,
        isLoading,
        error,
        activeFootnoteId,
        parseEmail,
        clearEmailData,
        setActiveFootnote
    } = useEmailData();

    const currentPage = parsedEmail ? 'reader' : 'input';

    const handleEmailParsed = () => {
        // This function is called after parsing is successful.
        // The page will automatically switch to 'reader' because `parsedEmail` will be set.
        // We can use this to update any internal state if needed, but for now, it's okay.
    };

    const handleBackToInput = () => {
        clearEmailData();
        // This will cause `parsedEmail` to become null, automatically switching the page to 'input'.
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
                flexDirection: 'column',
                alignItems: 'center', // Center the main content panel
            }}>
                {/* Main content panel */}
                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%', // Ensure the panel takes full width for centering content
                    maxWidth: '960px', // Max width for the content area
                    // p: 2, // Padding will be handled by header and content sections
                    position: 'relative', // Keep for potential future absolute elements if needed
                }}>
                    {/* Shared Header for title and theme toggle */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2, // Padding for the header
                        borderBottom: `1px solid ${theme.palette.divider}`, // Optional: adds a separator line
                        width: '100%',
                    }}>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                            {currentPage === 'input' ? (
                                <>
                                    <EmailIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                                    <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
                                        Money Stuff Reader
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }} component="span">
                                        by{' '}
                                        <a href="https://bojanbaros.com" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.mode === 'light' ? '#1976d2' : '#90caf9', textDecoration: 'none', fontWeight: 500 }}>
                                            Bojan Baros
                                        </a>
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Button startIcon={<ArrowBackIcon />} onClick={handleBackToInput} variant="outlined" sx={{ mr: 2 }}>
                                        Back
                                    </Button>
                                    <Typography variant="h6" component="h1" sx={{ color: 'primary.main', mr: 1 }}>
                                        Money Stuff Reader
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5, mr:2 }} component="span">
                                        by{' '}
                                        <a href="https://bojanbaros.com" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.mode === 'light' ? '#1976d2' : '#90caf9', textDecoration: 'none', fontWeight: 500 }}>
                                            Bojan Baros
                                        </a>
                                    </Typography>
                                    {parsedEmail && (
                                        <Typography variant="body2" color="text.secondary">
                                            {parsedEmail.footnotes.length} footnotes
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Box>
                        <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Box>

                    {/* Content Area */}
                    <Box sx={{ p: 2, width: '100%' }}>
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
                            // onBackToInput={handleBackToInput} // Removed prop
                        />
                    )
                )}
            </Box> {/* Closes Content Area */}
            </Box> {/* Closes Main content panel */}
            </Box> {/* Closes Outer App Box (the one with minHeight: '100vh') */}
        </ThemeProvider>
    );
}

export default App;