import React from 'react';
import { Container, Box, Button, Typography, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ParsedEmail } from '../utils/types';
import EmailMainContent from './EmailMainContent';
import FootnotesPanel from './FootnotesPanel';

interface EmailReaderPageProps {
    parsedEmail: ParsedEmail;
    activeFootnoteId: number | null;
    onFootnoteClick: (footnoteId: number) => void;
    onBackToInput: () => void;
}

const EmailReaderPage: React.FC<EmailReaderPageProps> = ({
    parsedEmail,
    activeFootnoteId,
    onFootnoteClick,
    onBackToInput
}) => {
    return (
        <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                        pb: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={onBackToInput}
                            variant="outlined"
                            sx={{ mr: 3 }}
                        >
                            Back to Input
                        </Button>

                        <Typography variant="h5" component="h1" sx={{ color: 'primary.main' }}>
                            Matt Reader
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {parsedEmail.footnotes.length} footnotes found
                        </Typography>
                        {activeFootnoteId && (
                            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                Viewing footnote [{activeFootnoteId}]
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Two-pane layout */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'column' },
                        gap: 2,
                        overflow: 'hidden'
                    }}
                >
                    {/* Main content pane - 60% height */}
                    <Box sx={{ height: { xs: '50%', md: '60%' }, minHeight: '300px' }}>
                        <EmailMainContent
                            parsedEmail={parsedEmail}
                            onFootnoteClick={onFootnoteClick}
                            activeFootnoteId={activeFootnoteId}
                        />
                    </Box>

                    {/* Footnotes pane - 40% height */}
                    <Box sx={{ height: { xs: '50%', md: '40%' }, minHeight: '200px' }}>
                        <FootnotesPanel
                            footnotes={parsedEmail.footnotes}
                            activeFootnoteId={activeFootnoteId}
                        />
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default EmailReaderPage;