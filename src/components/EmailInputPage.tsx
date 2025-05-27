import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    LinearProgress,
    Chip
} from '@mui/material';
import { Email, ArrowForward } from '@mui/icons-material';
import { ParsedEmail } from '../utils/types';

interface EmailInputPageProps {
    onEmailParsed: (parsedEmail: ParsedEmail) => void;
    isLoading: boolean;
    error: string | null;
    onParseEmail: (htmlContent: string) => Promise<ParsedEmail>;
}

const EmailInputPage: React.FC<EmailInputPageProps> = ({
    onEmailParsed,
    isLoading,
    error,
    onParseEmail
}) => {
    const [emailContent, setEmailContent] = useState('');

    const handleParseEmail = async () => {
        if (!emailContent.trim()) {
            return;
        }

        try {
            const parsedEmail = await onParseEmail(emailContent);
            onEmailParsed(parsedEmail);
        } catch (err) {
            // Error is handled by the hook
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'Enter') {
            handleParseEmail();
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Email sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" color="primary">
                        Matt Reader
                    </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                    Money Stuff Email Reader
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                    Paste your Matt Levine "Money Stuff" email below to get a better reading experience
                    with footnotes displayed in a separate, scrollable panel.
                </Typography>

                <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                        Instructions:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        <Chip
                            label="1. Copy email content from your email client (with formatting)"
                            variant="outlined"
                            size="small"
                        />
                        <Chip
                            label="2. Paste it in the text area below (HTML supported)"
                            variant="outlined"
                            size="small"
                        />
                        <Chip
                            label="3. Click 'Parse Email' or press Ctrl+Enter"
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    multiline
                    rows={12}
                    placeholder="Paste your Matt Levine email content here..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    onPaste={(e) => {
                        e.preventDefault();
                        const paste = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
                        setEmailContent(paste);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    sx={{ mb: 3 }}
                />

                {isLoading && <LinearProgress sx={{ mb: 2 }} />}

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {emailContent.length} characters
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleParseEmail}
                        disabled={!emailContent.trim() || isLoading}
                        endIcon={<ArrowForward />}
                    >
                        {isLoading ? 'Parsing...' : 'Parse Email'}
                    </Button>
                </Box>

                <Box mt={3}>
                    <Typography variant="caption" color="text.secondary">
                        This tool supports rich HTML email content with hyperlinks, images, and formatting.
                        For best results, copy directly from your email client (Gmail, Outlook, etc.) to preserve all formatting.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default EmailInputPage;