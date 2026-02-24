import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Divider, Paper, LinearProgress, Stack, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import * as pdfjsLib from 'pdfjs-dist';
// import { GlobalWorkerOptions } from 'pdfjs-dist';

// // This points to the worker inside your node_modules
// GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js',
//     import.meta.url,
// ).toString();

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

    const runComparison = async () => {
  setIsComparing(true);
  try {
    const text1 = await extractText(files.left);
    const text2 = await extractText(files.right);

    // Split into words and remove empty strings
    const words1 = text1.split(/\s+/).filter(w => w.length > 0);
    const words2 = text2.split(/\s+/).filter(w => w.length > 0);

    // Create frequency maps to handle duplicate words correctly
    const map1 = {};
    words1.forEach(w => map1[w] = (map1[w] || 0) + 1);
    
    const map2 = {};
    words2.forEach(w => map2[w] = (map2[w] || 0) + 1);

    // Calculate Matches
    let matchesCount = 0;
    Object.keys(map1).forEach(word => {
      if (map2[word]) {
        matchesCount += Math.min(map1[word], map2[word]);
      }
    });

    // Calculate Additions and Removals
    const added = words2.filter(word => !words1.includes(word));
    const removed = words1.filter(word => !words2.includes(word));

    // Similarity Score: (Matches * 2) / (Total words in both)
    // This is the Sorensen-Dice coefficient, very stable for text.
    const totalPossible = words1.length + words2.length;
    const percentage = totalPossible > 0 
        ? Math.round((2.0 * matchesCount / totalPossible) * 100) 
        : 0;

    setDiffResult({
      matches: `${percentage}%`,
      added: added.slice(0, 50), // Limit view for performance
      removed: removed.slice(0, 50),
      totalAdded: added.length,
      totalRemoved: removed.length
    });
  } catch (error) {
    console.error(error);
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
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Real-time Results</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="h3" color={parseInt(diffResult.matches) > 80 ? "success.main" : "warning.main"}>
                                        {diffResult.matches}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Text Similarity Score</Typography>
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body1">
                                            Found <b>{diffResult.added.length}</b> additions and <b>{diffResult.removed.length}</b> deletions.
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Text Differences</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                                        {diffResult.added.length === 0 && diffResult.removed.length === 0 ? (
                                            <Typography color="text.secondary">No differences detected in text.</Typography>
                                        ) : (<>
                                            {diffResult.added.map((line, i) => (
                                                <Box key={`add-${i}`} sx={{ borderLeft: '4px solid #4caf50', pl: 2, mb: 1, bgcolor: '#e8f5e9' }}>
                                                    <Typography variant="caption" color="success.main">+ Added</Typography>
                                                    <Typography variant="body2">{line}</Typography>
                                                </Box>
                                            ))}
                                            {diffResult.removed.map((line, i) => (
                                                <Box key={`rem-${i}`} sx={{ borderLeft: '4px solid #f44336', pl: 2, mb: 1, bgcolor: '#ffebee' }}>
                                                    <Typography variant="caption" color="error.main">- Removed</Typography>
                                                    <Typography variant="body2">{line}</Typography>
                                                </Box>
                                            ))}
                                        </>
                                        )}
                                    </Paper>
                                    {/* <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                                        <Typography variant="subtitle2" gutterBottom color="success.main">Words Added:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                            {diffResult.added.map((word, i) => (
                                                <Paper key={i} sx={{ px: 1, bgcolor: '#e8f5e9', border: '1px solid #4caf50' }}>
                                                    <Typography variant="body2">+{word}</Typography>
                                                </Paper>
                                            ))}
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" gutterBottom color="error.main">Words Removed:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {diffResult.removed.map((word, i) => (
                                                <Paper key={i} sx={{ px: 1, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                                                    <Typography variant="body2">-{word}</Typography>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </Paper> */}
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