import React from 'react';
import { Container, Box, Button, Typography, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"; // Removed
import { ParsedEmail } from '../utils/types';
import EmailMainContent from './EmailMainContent';
// import FootnotesPanel from './FootnotesPanel'; // Removed

interface EmailReaderPageProps {
    parsedEmail: ParsedEmail;
    activeFootnoteId: number | null;
    onFootnoteClick: (footnoteId: number, currentTarget: HTMLElement | null) => void; // Signature updated
    onBackToInput: () => void;
}

const EmailReaderPage: React.FC<EmailReaderPageProps> = ({
    parsedEmail,
    activeFootnoteId,
    onFootnoteClick,
    onBackToInput
}) => {
    return (
        <Container maxWidth="xl" sx={{ height: '100vh', py: 2, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    pb: 1,
                    flexShrink: 0, // Prevent header from shrinking
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={onBackToInput}
                        variant="outlined"
                        sx={{ mr: 3 }}
                    >
                        Back
                    </Button>

                    <Typography variant="h6" component="h1" sx={{ color: 'primary.main' }}>
                        Money Stuff Reader
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', ml: 1 }}
                        component="span"
                    >
                        by{' '}
                        <a
                            href="https://bojanbaros.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                        >
                            Bojan Baros
                        </a>
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {parsedEmail.footnotes.length} footnotes found
                    </Typography>
                    {/* The "Viewing footnote [id]" can be removed or kept if desired,
                        but the popover itself will show the active footnote.
                        Keeping it for now as it provides some context in the header. */}
                    {activeFootnoteId && (
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            Viewing footnote [{activeFootnoteId}]
                        </Typography>
                    )}
                </Box>
            </Box>

            <Divider sx={{ mb: 2, flexShrink: 0 }} />

            {/* Main Content Area */}
            <Box
                sx={{
                    flex: 1, // Takes up remaining vertical space
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden', // Important for inner scrollable content
                }}
            >
                <EmailMainContent
                    parsedEmail={parsedEmail}
                    onFootnoteClick={onFootnoteClick} // Passed through with updated signature
                    activeFootnoteId={activeFootnoteId}
                />
                {/* FootnotesPanel and PanelGroup are removed */}
            </Box>
        </Container>
    );
};

export default EmailReaderPage;
