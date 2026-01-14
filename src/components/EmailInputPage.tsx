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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { ArrowForward, ContentPaste } from '@mui/icons-material'; // Removed Email
import { ParsedEmail } from '../utils/types';
import { findFootnoteReferences, parseMatthewLevineEmail } from '../utils/emailParser';

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
    const [showWarning, setShowWarning] = useState(false);
    const [pendingContent, setPendingContent] = useState<string | null>(null);

    const callOnParseEmailSafe = async (content: string) => {
        try {
            const parsedEmail = await onParseEmail(content);
            onEmailParsed(parsedEmail);
        } catch (err) {
            // Error is handled by the hook
        }
    };

    const handleParseEmail = async (contentOverride?: string) => {
        const contentToParse = typeof contentOverride === 'string' ? contentOverride : emailContent;

        if (!contentToParse.trim()) {
            return;
        }

        try {
            // Local parse to check for warning without updating global state
            const localParsed = parseMatthewLevineEmail(contentToParse);

            // Check for missing footnotes
            const references = findFootnoteReferences(localParsed.mainContent);
            const footnoteIds = localParsed.footnotes.map(f => f.id);

            // Detect if we have references but missing definitions
            const missingDefinitions = references.filter(id => !footnoteIds.includes(id));

            // Trigger warning if we have references but significantly missing footnotes
            if (references.length > 0 && missingDefinitions.length > 0) {
                setPendingContent(contentToParse);
                setShowWarning(true);
                return; // Stop and wait for user confirmation
            }
        } catch (err) {
            // If local parse fails (e.g. invalid format), let the main handler try and set the error state
        }

        // If no warning needed or local parse failed, proceed
        await callOnParseEmailSafe(contentToParse);
    };

    const handleContinueParsing = () => {
        if (pendingContent) {
            callOnParseEmailSafe(pendingContent);
        }
        handleCloseWarning();
    };

    const handleCloseWarning = () => {
        setShowWarning(false);
        setPendingContent(null);
    };

    const handleBackFromWarning = () => {
        setEmailContent('');
        handleCloseWarning();
    };

    const handlePasteAndParse = async () => {
        let text = '';
        try {
            // navigator.clipboard.read() allows accessing different mime types like text/html.
            // We'll try to use it if available to preserve formatting.
            if (navigator.clipboard && navigator.clipboard.read) {
                const clipboardItems = await navigator.clipboard.read();
                for (const item of clipboardItems) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        text = await blob.text();
                        break;
                    }
                    if (item.types.includes('text/plain')) {
                        const blob = await item.getType('text/plain');
                        text = await blob.text();
                        break;
                    }
                }
            }

            if (!text) {
                // Fallback to readText
                text = await navigator.clipboard.readText();
            }

        } catch (err) {
            console.error('Failed to paste from clipboard:', err);
            // In case read() failed or permission denied, try readText as a backup.
            try {
                text = await navigator.clipboard.readText();
            } catch (readTextErr) {
                console.error('Failed to read clipboard text:', readTextErr);
            }
        }

        if (text) {
            setEmailContent(text);
            handleParseEmail(text);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'Enter') {
            handleParseEmail();
        }
    };

    return (
        // Container and Paper are kept, but the specific header Box is removed.
        // The sx prop for py: 4 on Container can be removed if App.tsx's content Box padding is sufficient.
        // For now, let's keep it to maintain some top/bottom spacing for the Paper element.
        <Container maxWidth="md" sx={{ pt: 0, pb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                {/* The Box with Email icon, Title, and Byline has been moved to App.tsx */}

                <Typography variant="h6" gutterBottom sx={{mt: 2}}> {/* Added margin top for spacing */}
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
                    placeholder="Paste your Matt Levine Money Stuff email here..."
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

                    <Box display="flex" gap={2}>
                        <Button
                            startIcon={<ContentPaste />}
                            onClick={handlePasteAndParse}
                            size="large"
                            disabled={isLoading}
                            variant="outlined"
                        >
                            Paste & Parse
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleParseEmail()}
                            disabled={!emailContent.trim() || isLoading}
                            endIcon={<ArrowForward />}
                        >
                            {isLoading ? 'Parsing...' : 'Parse Email'}
                        </Button>
                    </Box>
                </Box>

                <Box mt={3}>
                    <Typography variant="caption" color="text.secondary">
                        This tool supports rich HTML email content with hyperlinks, images, and formatting.
                        For best results, copy directly from your email client (Gmail, Outlook, etc.) to preserve all formatting.
                    </Typography>
                </Box>
            </Paper>

            <Dialog
                open={showWarning}
                onClose={handleCloseWarning}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Warning: Missing Footnotes"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        It looks like the text you pasted contains footnote references (e.g., [1]), but the footnotes themselves are missing.
                        <br /><br />
                        This usually happens if the email text was cut off by your email client (e.g., "Message clipped", "View entire message").
                        <br /><br />
                        You can continue with the partial content, or go back to copy the full email text.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBackFromWarning} color="inherit">
                        Back
                    </Button>
                    <Button onClick={handleContinueParsing} variant="contained" autoFocus>
                        Continue Anyway
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EmailInputPage;
