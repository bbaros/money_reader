import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, Popover } from '@mui/material';
import { ParsedEmail, Footnote } from '../utils/types';

interface EmailMainContentProps {
    parsedEmail: ParsedEmail;
    onFootnoteClick: (footnoteId: number, currentTarget: HTMLElement | null) => void; // Updated to include currentTarget
    activeFootnoteId: number | null;
    // popoverAnchorEl: HTMLElement | null; // Removed, will be managed internally
    // setPopoverAnchorEl: (element: HTMLElement | null) => void; // Removed
}

const EmailMainContent: React.FC<EmailMainContentProps> = ({
    parsedEmail,
    onFootnoteClick,
    activeFootnoteId
}) => {
    const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);

    const currentFootnote: Footnote | undefined = useMemo(() => {
        if (!activeFootnoteId) return undefined;
        return parsedEmail.footnotes.find(fn => fn.id === activeFootnoteId);
    }, [activeFootnoteId, parsedEmail.footnotes]);

    const processedContent = useMemo(() => {
        let content = parsedEmail.mainContent;

        // Check if content contains HTML tags
        const isHtml = /<[a-z][\s\S]*>/i.test(content);

        if (isHtml) {
            // For HTML content, replace footnote references with clickable spans
            content = content.replace(/\[(\d+)\]/g, (match, id) => {
                const footnoteId = parseInt(id, 10);
                const isActive = footnoteId === activeFootnoteId;
                const className = `footnote-ref ${isActive ? 'active' : ''}`;
                return `<span class="${className}" data-footnote-id="${id}" style="cursor: pointer; color: #1976d2; font-weight: bold; padding: 2px 4px; border-radius: 4px; transition: all 0.2s ease; background-color: ${isActive ? '#bbdefb' : 'transparent'};">${match}</span>`;
            });
        }

        return content;
    }, [parsedEmail.mainContent, activeFootnoteId]);

    const renderContentWithClickableFootnotes = (content: string) => {
        // Check if content contains HTML tags
        const isHtml = /<[a-z][\s\S]*>/i.test(content);

        if (isHtml) {
            // For HTML content, we'll handle clicks via event delegation
            return null; // Return null to use dangerouslySetInnerHTML
        }

        // For plain text, use the existing logic
        const parts = content.split(/(\[\d+\])/g);

        return parts.map((part, index) => {
            const footnoteMatch = part.match(/^\[(\d+)\]$/);

            if (footnoteMatch) {
                const footnoteId = parseInt(footnoteMatch[1], 10);
                const isActive = footnoteId === activeFootnoteId;

                return (
                    <Box
                        key={index}
                        component="span"
                        onClick={(event) => {
                            onFootnoteClick(footnoteId, event.currentTarget);
                            setPopoverAnchorEl(event.currentTarget);
                        }}
                        sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            fontWeight: 'bold',
                            backgroundColor: isActive ? 'primary.light' : 'transparent',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        {part}
                    </Box>
                );
            }

            // Regular text content
            return <span key={index}>{part}</span>;
        });
    };

    const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;

        // Handle both footnote references [1] and footnote links
        if (target.classList.contains('footnote-ref') || target.classList.contains('footnote-link')) {
            event.preventDefault();
            const footnoteId = parseInt(target.dataset.footnoteId || '0', 10);
            if (footnoteId) {
                onFootnoteClick(footnoteId, target);
                setPopoverAnchorEl(target);
            }
        }
    };

    const handlePopoverClose = () => {
        setPopoverAnchorEl(null);
        // Call onFootnoteClick with null to signal closing the footnote view
        // This is important if App.tsx logic relies on activeFootnoteId to be null when no footnote is active
        if (activeFootnoteId !== null) { // Avoids redundant calls if already null
             onFootnoteClick(activeFootnoteId, null); // Or pass null as footnoteId if that's the new convention for closing
        }
    };

    const isHtml = /<[a-z][\s\S]*>/i.test(parsedEmail.mainContent);

    return (
        <>
            <Paper
                elevation={1}
                sx={{
                    height: '100%',
                    overflow: 'auto',
                    p: 3,
                    backgroundColor: 'background.paper'
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                    Main Content
                </Typography>

                {isHtml ? (
                    <Box
                        onClick={handleContentClick}
                        dangerouslySetInnerHTML={{ __html: processedContent }}
                        sx={{
                            '& p': { mb: 2 },
                            '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 3, mb: 2 },
                            '& a': {
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            },
                            '& img': {
                                maxWidth: '100%',
                                height: 'auto'
                            },
                            '& .footnote-ref, & .footnote-link': {
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#e3f2fd !important',
                                    transform: 'scale(1.1)'
                                }
                            },
                            '& .footnote-link': {
                                color: 'primary.main',
                                textDecoration: 'underline',
                                fontWeight: 'bold'
                            },
                            lineHeight: 1.7,
                            fontSize: '1rem'
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            '& p': { mb: 2 },
                            '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 3, mb: 2 },
                            lineHeight: 1.7,
                            fontSize: '1rem'
                        }}
                    >
                        <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                            {renderContentWithClickableFootnotes(parsedEmail.mainContent)}
                        </Typography>
                    </Box>
                )}
            </Paper>
            {currentFootnote && (
                <Popover
                    open={Boolean(popoverAnchorEl && activeFootnoteId)}
                    anchorEl={popoverAnchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    PaperProps={{
                        sx: {
                            p: 2,
                            maxWidth: 350,
                            border: '1px solid',
                            borderColor: 'primary.main',
                            boxShadow: 3,
                        }
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        Footnote [{currentFootnote.id}]
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {currentFootnote.content}
                    </Typography>
                </Popover>
            )}
        </>
    );
};

export default EmailMainContent;