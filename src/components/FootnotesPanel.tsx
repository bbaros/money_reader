import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, List, ListItem, Divider } from '@mui/material';
import { Footnote } from '../utils/types';

interface FootnotesPanelProps {
    footnotes: Footnote[];
    activeFootnoteId: number | null;
}

const FootnotesPanel: React.FC<FootnotesPanelProps> = ({
    footnotes,
    activeFootnoteId
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const footnoteRefs = useRef<{ [key: number]: HTMLLIElement }>({});

    // Auto-scroll to active footnote when it changes
    useEffect(() => {
        if (activeFootnoteId && footnoteRefs.current[activeFootnoteId] && containerRef.current) {
            const footnoteElement = footnoteRefs.current[activeFootnoteId];
            const container = containerRef.current;

            // Calculate scroll position to center the footnote in view
            const containerHeight = container.clientHeight;
            const footnoteTop = footnoteElement.offsetTop;
            const footnoteHeight = footnoteElement.clientHeight;

            const scrollTop = footnoteTop - (containerHeight / 2) + (footnoteHeight / 2);

            container.scrollTo({
                top: Math.max(0, scrollTop),
                behavior: 'smooth'
            });
        }
    }, [activeFootnoteId]);

    return (
        <Paper
            elevation={1}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper'
            }}
        >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                    Footnotes ({footnotes.length})
                </Typography>
            </Box>

            <Box
                ref={containerRef}
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 1
                }}
            >
                {footnotes.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'text.secondary'
                        }}
                    >
                        <Typography variant="body2">
                            No footnotes found in this email
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {footnotes.map((footnote, index) => (
                            <React.Fragment key={footnote.id}>
                                <ListItem
                                    ref={el => {
                                        if (el) footnoteRefs.current[footnote.id] = el;
                                    }}
                                    sx={{
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        py: 2,
                                        px: 2,
                                        backgroundColor: activeFootnoteId === footnote.id
                                            ? 'primary.light'
                                            : 'transparent',
                                        borderRadius: 1,
                                        mb: 1,
                                        transition: 'all 0.3s ease',
                                        border: activeFootnoteId === footnote.id
                                            ? 1
                                            : 1,
                                        borderColor: activeFootnoteId === footnote.id
                                            ? 'primary.main'
                                            : 'divider',
                                        '&:hover': {
                                            backgroundColor: activeFootnoteId === footnote.id
                                                ? 'primary.light'
                                                : 'action.hover'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: 'primary.main',
                                                backgroundColor: 'primary.contrastText',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                border: 1,
                                                borderColor: 'primary.main'
                                            }}
                                        >
                                            [{footnote.id}]
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            lineHeight: 1.6,
                                            whiteSpace: 'pre-wrap',
                                            fontWeight: activeFootnoteId === footnote.id ? 'bold' : 'normal',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {footnote.content}
                                    </Typography>
                                </ListItem>

                                {index < footnotes.length - 1 && (
                                    <Divider sx={{ my: 1, mx: 2 }} />
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Paper>
    );
};

export default FootnotesPanel;