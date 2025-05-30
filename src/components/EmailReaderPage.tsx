import React from 'react';
import { Container, Box, Button, Typography, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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
                        flexDirection: 'column', // PanelGroup handles vertical layout
                        overflow: 'hidden'
                    }}
                >
                    <PanelGroup direction="vertical" style={{ flex: 1, overflow: 'hidden' }}>
                        <Panel defaultSize={60} minSize={20}>
                            <EmailMainContent
                                parsedEmail={parsedEmail}
                                onFootnoteClick={onFootnoteClick}
                                activeFootnoteId={activeFootnoteId}
                            />
                        </Panel>
                        <PanelResizeHandle style={{ height: '4px', backgroundColor: '#e0e0e0' }} />
                        <Panel defaultSize={40} minSize={10}>
                            <FootnotesPanel
                                footnotes={parsedEmail.footnotes}
                                activeFootnoteId={activeFootnoteId}
                            />
                        </Panel>
                    </PanelGroup>
                </Box>
            </Box>
        </Container>
    );
};

export default EmailReaderPage;
