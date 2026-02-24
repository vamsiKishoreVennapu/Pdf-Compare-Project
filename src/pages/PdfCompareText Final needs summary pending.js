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
    const [extractedData, setExtractedData] = useState({ left: [], right: [] });
    const [currentPage, setCurrentPage] = useState(0);
    const [isComparing, setIsComparing] = useState(false);
    const [diffResult, setDiffResult] = useState(null);
    const handleFileUpload = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [side]: file }));
            console.log(`File uploaded to ${side}:`, file);
        }
    };
    const runComparison = async () => {
        setIsComparing(true);
        try {
            const leftPages = await extractText(files.left);
            const rightPages = await extractText(files.right);
            
            setExtractedData({ left: leftPages, right: rightPages });
            
            // Generate initial diff for Page 1
            generatePageDiff(0, leftPages, rightPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsComparing(false);
        }
    };
const extractText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let pagesText = [];

    const numPages = Math.min(pdf.numPages, 6);
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Join words on this specific page
        const pageString = content.items.map(item => item.str).join(' ');
        pagesText.push(pageString);
    }
    return pagesText; // Returns ['text of page 1', 'text of page 2'...]
};
    const generatePageDiff = (pageIdx, leftData, rightData) => {
        const text1 = leftData[pageIdx] || "";
        const text2 = rightData[pageIdx] || "";
        
        const diff = diffWordsWithSpace(text1, text2);
        
        setDiffResult({
            fullDiff: diff,
            totalAdded: diff.filter(p => p.added).length,
            totalRemoved: diff.filter(p => p.removed).length
        });
    };

    const handlePageChange = (direction) => {
        const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
        setCurrentPage(newPage);
        generatePageDiff(newPage, extractedData.left, extractedData.right);
    };

    const totalPages = Math.max(extractedData.left.length, extractedData.right.length);

    return (
        <Box sx={{ p: 3 }}>
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
                <Box sx={{ mt: 3 }}>
                    {/* PAGE NAVIGATION ARROWS */}
                    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                        <Button 
                            variant="contained" 
                            disabled={currentPage === 0}
                            onClick={() => handlePageChange('prev')}
                        >
                            ← Previous Page
                        </Button>
                        <Typography variant="h6">
                            Page {currentPage + 1} of {totalPages}
                        </Typography>
                        <Button 
                            variant="contained" 
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => handlePageChange('next')}
                        >
                            Next Page →
                        </Button>
                    </Stack>

                    <Grid container spacing={2}>
                        {/* LEFT SIDE: ORIGINAL */}

                        <Grid item size={{ xs: 12, md: 6 }}>
                             <Typography variant="overline" color="error.main">Original (Page {currentPage + 1})</Typography>
                            <Paper variant="outlined" sx={{ p: 2, height: 500, overflow: 'auto', bgcolor: '#fafafa' }}>
                                {diffResult.fullDiff.map((part, i) => !part.added && (
                                    <Box component="span" key={i} sx={{ 
                                        bgcolor: part.removed ? '#ffebee' : 'transparent',
                                        textDecoration: part.removed ? 'line-through' : 'none',
                                        color: part.removed ? '#c62828' : 'inherit'
                                    }}>
                                        {part.value}
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>

                        {/* RIGHT SIDE: REVISED */}
                        <Grid item size={{ xs: 12, md: 6 }}>
                            <Typography variant="overline" color="success.main">Revised (Page {currentPage + 1})</Typography>
                            <Paper variant="outlined" sx={{ p: 2, height: 500, overflow: 'auto', bgcolor: '#fafafa' }}>
                                {diffResult.fullDiff.map((part, i) => !part.removed && (
                                    <Box component="span" key={i} sx={{ 
                                        bgcolor: part.added ? '#e8f5e9' : 'transparent',
                                        color: part.added ? '#2e7d32' : 'inherit'
                                    }}>
                                        {part.value}
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Changes on this page: {diffResult.totalAdded} additions, {diffResult.totalRemoved} deletions.
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

const UploadButton = ({ label, onUpload, color }) => (
    <Button component="label" variant="outlined" color={color} startIcon={<CloudUploadIcon />} sx={{ width: 250, textTransform: 'none' }}>
        <Typography noWrap>{label}</Typography>
        <input type="file" hidden accept="application/pdf" onChange={onUpload} />
    </Button>
);