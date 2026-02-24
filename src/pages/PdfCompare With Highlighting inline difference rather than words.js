import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Divider, Paper, LinearProgress, Stack, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import * as pdfjsLib from 'pdfjs-dist';
import { diffWordsWithSpace } from 'diff';

const pdfjsVersion = '3.11.174'; // Match this to your package.json version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

export const PdfCompare = () => {

    const [files, setFiles] = useState({ left: null, right: null });
    const [isComparing, setIsComparing] = useState(false);
    const [diffResult, setDiffResult] = useState(null);

    const handleFileUpload = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [side]: file }));
            console.log(`File uploaded to ${side}:`, file);
        }
    };

    // Utility to extract text from PDF

    const extractText = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        // Limit to 6 pages as per your requirement

        const numPages = Math.min(pdf.numPages, 6);
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            fullText += strings.join(' ') + "\n";
        }
        return fullText;
    };

    //     const extractText = async (file) => {
    //     const arrayBuffer = await file.arrayBuffer();
    //     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    //     let fullText = "";

    //     const numPages = Math.min(pdf.numPages, 6);
    //     for (let i = 1; i <= numPages; i++) {
    //         const page = await pdf.getPage(i);
    //         const content = await page.getTextContent();

    //         // Use a more granular join. Joining by newline ensures 
    //         // pixelmatch/diffing logic sees individual strings as separate lines.
    //         const strings = content.items.map(item => item.str.trim());

    //         // Filter out empty strings to prevent "phantom" differences
    //         const pageText = strings.filter(s => s !== "").join('\n');
    //         fullText += pageText + "\n";
    //     }
    //     return fullText;
    // };

    // const extractText = async (file) => {
    //     const arrayBuffer = await file.arrayBuffer();
    //     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    //     let fullText = "";

    //     const numPages = Math.min(pdf.numPages, 6);
    //     for (let i = 1; i <= numPages; i++) {
    //         const page = await pdf.getPage(i);
    //         const content = await page.getTextContent();
    //         // Join items with a space to create a continuous stream of words per page
    //         const pageText = content.items.map(item => item.str).join(' ');
    //         fullText += pageText + " ";
    //     }
    //     // Clean up multiple spaces to single spaces
    //     return fullText.replace(/\s+/g, ' ').trim();
    // };

    // const runComparison = async () => {
    //     setIsComparing(true);
    //     try {
    //         const text1 = await extractText(files.left);
    //         const text2 = await extractText(files.right);

    //         // Simple line-by-line comparison logic
    //         const lines1 = text1.split('\n');
    //         const lines2 = text2.split('\n');
    //         const added = lines2.filter(line => !lines1.includes(line) && line.trim() !== "");
    //         const removed = lines1.filter(line => !lines2.includes(line) && line.trim() !== "");

    //         // Calculate a rough similarity percentage

    //         const totalLines = Math.max(lines1.length, lines2.length);
    //         const matches = totalLines - (added.length + removed.length);
    //         const percentage = Math.max(0, Math.floor((matches / totalLines) * 100));
    //         setDiffResult({
    //             matches: `${percentage}%`,
    //             added,
    //             removed,
    //             changes: added.length + removed.length
    //         });
    //     } catch (error) {
    //         console.error("PDF Parsing failed", error);
    //         alert("Failed to parse PDF. Ensure it's not password protected.");
    //     } finally {
    //         setIsComparing(false);
    //     }
    // };

    //     const runComparison = async () => {
    //   setIsComparing(true);
    //   try {
    //     const text1 = await extractText(files.left);
    //     const text2 = await extractText(files.right);

    //     // Split into words and remove empty strings
    //     const words1 = text1.split(/\s+/).filter(w => w.length > 0);
    //     const words2 = text2.split(/\s+/).filter(w => w.length > 0);

    //     // Create frequency maps to handle duplicate words correctly
    //     const map1 = {};
    //     words1.forEach(w => map1[w] = (map1[w] || 0) + 1);

    //     const map2 = {};
    //     words2.forEach(w => map2[w] = (map2[w] || 0) + 1);

    //     // Calculate Matches
    //     let matchesCount = 0;
    //     Object.keys(map1).forEach(word => {
    //       if (map2[word]) {
    //         matchesCount += Math.min(map1[word], map2[word]);
    //       }
    //     });

    //     // Calculate Additions and Removals
    //     const added = words2.filter(word => !words1.includes(word));
    //     const removed = words1.filter(word => !words2.includes(word));

    //     // Similarity Score: (Matches * 2) / (Total words in both)
    //     // This is the Sorensen-Dice coefficient, very stable for text.
    //     const totalPossible = words1.length + words2.length;
    //     const percentage = totalPossible > 0 
    //         ? Math.round((2.0 * matchesCount / totalPossible) * 100) 
    //         : 0;

    //     setDiffResult({
    //       matches: `${percentage}%`,
    //       added: added.slice(0, 50), // Limit view for performance
    //       removed: removed.slice(0, 50),
    //       totalAdded: added.length,
    //       totalRemoved: removed.length
    //     });
    //   } catch (error) {
    //     console.error(error);
    //   } finally {
    //     setIsComparing(false);
    //   }
    // };

const runComparison = async () => {
    setIsComparing(true);
    try {
        const text1 = await extractText(files.left);
        const text2 = await extractText(files.right);

        // diffWordsWithSpace is excellent for word-level precision
        const diff = diffWordsWithSpace(text1, text2);

        // Filter the parts to get specific lists for the summary cards
        const addedParts = diff.filter(part => part.added);
        const removedParts = diff.filter(part => part.removed);

        // Calculate similarity based on character length of unchanged vs total
        const totalChars = text2.length;
        const unchangedChars = diff
            .filter(part => !part.added && !part.removed)
            .reduce((acc, part) => acc + part.value.length, 0);
        
        const percentage = totalChars > 0 
            ? Math.round((unchangedChars / totalChars) * 100) 
            : 0;

        setDiffResult({
            matches: `${percentage}%`,
            fullDiff: diff,
            added: addedParts, // Storing objects instead of just strings
            removed: removedParts,
            totalAdded: addedParts.length,
            totalRemoved: removedParts.length
        });
    } catch (error) {
        console.error("Comparison Error:", error);
    } finally {
        setIsComparing(false);
    }
};
    // const runComparison = async () => {
    //     setIsComparing(true);
    //     try {
    //         const text1 = await extractText(files.left);
    //         const text2 = await extractText(files.right);

    //         const words1 = text1.split(' ');
    //         const words2 = text2.split(' ');

    //         // We identify added words (in text2 but not text1) 
    //         // and removed words (in text1 but not text2)
    //         // Note: For a true "diff" (showing order), a library like 'diff' is better,
    //         // but this logic identifies the specific words changed.

    //         const added = words2.filter(word => !words1.includes(word));
    //         const removed = words1.filter(word => !words2.includes(word));

    //         // Calculate similarity based on word count
    //         const totalWords = Math.max(words1.length, words2.length);
    //         const uniqueChanges = new Set([...added, ...removed]).size;
    //         const percentage = Math.max(0, Math.floor(((totalWords - uniqueChanges) / totalWords) * 100));

    //         setDiffResult({
    //             matches: `${percentage}%`,
    //             added: [...new Set(added)], // Unique words added
    //             removed: [...new Set(removed)], // Unique words removed
    //         });
    //     } catch (error) {
    //         console.error("Comparison failed", error);
    //     } finally {
    //         setIsComparing(false);
    //     }
    // };

    return (

        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>PDF Comparison Utility</Typography>
            <Grid container spacing={3}>
                <Grid size={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                                <UploadButton
                                    label={files.left ? files.left.name : "Upload Original PDF"}
                                    onUpload={(e) => handleFileUpload(e, 'left')}
                                    color={files.left ? "success" : "primary"}
                                />
                                <CompareArrowsIcon color="action" />
                                <UploadButton
                                    label={files.right ? files.right.name : "Upload Revised PDF"}
                                    onUpload={(e) => handleFileUpload(e, 'right')}
                                    color={files.right ? "success" : "primary"}
                                />
                            </Stack>
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    disabled={!files.left || !files.right || isComparing}
                                    onClick={runComparison}
                                    size="large"
                                >
                                    {isComparing ? 'Analyzing Text...' : 'Compare Documents'}
                                </Button>
                            </Box>
                        </CardContent>
                        {isComparing && <LinearProgress />}
                    </Card>
                </Grid>
                 {diffResult && (
    <>
        <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Analysis Summary</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography 
                        variant="h3" 
                        color={parseInt(diffResult.matches) > 80 ? "success.main" : "warning.main"}
                    >
                        {diffResult.matches}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Overall Similarity
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body1">
                            {/* FIXED: Using the total count variables we created */}
                            Found <b>{diffResult.totalAdded}</b> additions and <b>{diffResult.totalRemoved}</b> deletions.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Grid>

        <Grid item xs={12} md={8}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Word-Level Comparison</Typography>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            bgcolor: 'white', 
                            lineHeight: 1.8, 
                            maxHeight: 500, 
                            overflow: 'auto',
                            fontFamily: 'monospace' 
                        }}
                    >
                        {diffResult.fullDiff.map((part, index) => {
                            const color = part.added ? '#2e7d32' : part.removed ? '#c62828' : 'inherit';
                            const backgroundColor = part.added ? '#e8f5e9' : part.removed ? '#ffebee' : 'transparent';
                            const textDecoration = part.removed ? 'line-through' : 'none';

                            return (
                                <Box
                                    component="span"
                                    key={index}
                                    sx={{
                                        color,
                                        bgcolor: backgroundColor,
                                        textDecoration,
                                        px: part.added || part.removed ? 0.2 : 0,
                                        borderRadius: '2px',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                >
                                    {part.value}
                                </Box>
                            );
                        })}
                    </Paper>
                </CardContent>
            </Card>
        </Grid>
    </>
)}
            </Grid>
        </Box>
    );
};

const UploadButton = ({ label, onUpload, color }) => (
    <Button component="label" variant="outlined" color={color} startIcon={<CloudUploadIcon />} sx={{ width: 250, textTransform: 'none' }}>
        <Typography noWrap>{label}</Typography>
        <input type="file" hidden accept="application/pdf" onChange={onUpload} />
    </Button>
);