import React from 'react';
import { Container, Box, Typography } from '@mui/material'; // Removed Button, Divider
// import { ArrowBack } from '@mui/icons-material'; // Removed ArrowBack
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"; // Removed
import { ParsedEmail } from '../utils/types';
import EmailMainContent from './EmailMainContent';
// import FootnotesPanel from './FootnotesPanel'; // Removed

interface EmailReaderPageProps {
    parsedEmail: ParsedEmail;
    activeFootnoteId: number | null;
    onFootnoteClick: (footnoteId: number, currentTarget: HTMLElement | null) => void; // Signature updated
    // onBackToInput: () => void; // Removed onBackToInput from props
}

const EmailReaderPage: React.FC<EmailReaderPageProps> = ({
    parsedEmail,
    activeFootnoteId,
    onFootnoteClick
    // onBackToInput // Removed from destructuring
}) => {
    return (
        // The main Container's padding `py: 2` might be redundant due to App.tsx's header/content padding.
        // Setting pt: 0 to avoid double padding at the top.
        <Container maxWidth="xl" sx={{ height: '100vh', pt: 0, pb: 2, display: 'flex', flexDirection: 'column' }}>
            {/* Header (Back button, Title, Byline, Footnote count) has been moved to App.tsx */}
            {/* Divider has been moved to App.tsx (as borderBottom on the header Box) */}

            {/* Active footnote indicator can remain here or be moved if preferred */}
            {activeFootnoteId && (
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold', textAlign: 'right', pb:1 }}>
                    Viewing footnote [{activeFootnoteId}]
                </Typography>
            )}

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
