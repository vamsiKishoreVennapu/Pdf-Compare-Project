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
    const [docSummary, setDocSummary] = useState(null); // New state for overall stats

    const runComparison = async () => {
        setIsComparing(true);
        try {
            const leftPages = await extractText(files.left);
            const rightPages = await extractText(files.right);

            setExtractedData({ left: leftPages, right: rightPages });

            // 1. Calculate Overall Summary
            calculateOverallSummary(leftPages, rightPages);

            // 2. Generate initial diff for Page 1
            generatePageDiff(0, leftPages, rightPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsComparing(false);
        }
    };

    const handleFileUpload = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [side]: file }));
            console.log(`File uploaded to ${side}:`, file);
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

    const calculateOverallSummary = (leftPages, rightPages) => {
        let totalChanges = 0;
        let totalChars = 0;
        let totalMatches = 0;

        const maxPages = Math.max(leftPages.length, rightPages.length);

        for (let i = 0; i < maxPages; i++) {
            const d = diffWordsWithSpace(leftPages[i] || "", rightPages[i] || "");
            d.forEach(part => {
                if (part.added || part.removed) {
                    totalChanges += part.value.length;
                } else {
                    totalMatches += part.value.length;
                }
            });
        }

        totalChars = totalMatches + totalChanges;
        const score = totalChars > 0 ? Math.round((totalMatches / totalChars) * 100) : 0;

        setDocSummary({
            percentage: score,
            totalChangeLength: totalChanges,
            pageCount: maxPages
        });
    };

    // ... generatePageDiff and handlePageChange remain the same ...

    return (
        <Box sx={{ p: 3 }}>
            {/* Upload Section */}
            <Grid container spacing={3}>
                <Grid  item size={{ xs: 12, md: 12 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                                <UploadButton
                                    label={files.left ? files.left.name : "Upload Original"}
                                    onUpload={(e) => handleFileUpload(e, 'left')}
                                    color={files.left ? "success" : "primary"}
                                />
                                <CompareArrowsIcon color="action" />
                                <UploadButton
                                    label={files.right ? files.right.name : "Upload Revised"}
                                    onUpload={(e) => handleFileUpload(e, 'right')}
                                    color={files.right ? "success" : "primary"}
                                />
                            </Stack>
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button variant="contained" disabled={!files.left || !files.right || isComparing} onClick={runComparison}>
                                    {isComparing ? 'Analyzing...' : 'Compare Documents'}
                                </Button>
                            </Box>
                        </CardContent>
                        {isComparing && <LinearProgress />}
                    </Card>
                </Grid>

                {/* SUMMARY SECTION */}
                {docSummary && (
                    <Grid  item size={{ xs: 3, md: 3 }} paddingTop={"75px"}>
                        <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderLeft: '6px solid', borderColor: 'primary.main' }}>
                            <Grid container alignItems="center" spacing={4}>
                                <Grid item>
                                    <Typography variant="h6" color="text.secondary">Overall Match</Typography>
                                    <Typography variant="h2" sx={{ fontWeight: 'bold', color: docSummary.percentage > 80 ? 'success.main' : 'warning.main' }}>
                                        {docSummary.percentage}%
                                    </Typography>
                                </Grid>
                                <Divider orientation="vertical" flexItem sx={{ mx: 3 }} />
                                <Grid item xs>
                                    <Typography variant="subtitle1"><b>Document Analysis</b></Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Comparison of {docSummary.pageCount} pages complete.
                                        We detected changes affecting approximately {docSummary.totalChangeLength} characters across the document.
                                    </Typography>
                                    <Box sx={{ mt: 1, width: '100%', maxWidth: 400 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={docSummary.percentage}
                                            color={docSummary.percentage > 80 ? "success" : "warning"}
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                )}

                {/* PAGE NAVIGATION & DIFF VIEW (Your existing code) */}
                {diffResult && (
                    <Grid item size={{ xs: 9, md: 9 }}>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ my: 2 }}>
                            <Button disabled={currentPage === 0} onClick={() => handlePageChange('prev')}>← Previous</Button>
                            <Typography>Page {currentPage + 1} of {totalPages}</Typography>
                            <Button disabled={currentPage >= totalPages - 1} onClick={() => handlePageChange('next')}>Next →</Button>
                        </Stack>

                        <Grid container spacing={2}>
                            <Grid item size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 2, height: 500, overflow: 'auto' }}>
                                    {/* Left Side Logic */}
                                    {diffResult.fullDiff.map((part, i) => !part.added && (
                                        <Box component="span" key={i} sx={{ bgcolor: part.removed ? '#ffebee' : 'transparent', textDecoration: part.removed ? 'line-through' : 'none', color: part.removed ? '#c62828' : 'inherit' }}>
                                            {part.value}
                                        </Box>
                                    ))}
                                </Paper>
                            </Grid>
                            <Grid item size={{ xs: 12, md: 6 }}>
                                <Paper variant="outlined" sx={{ p: 2, height: 500, overflow: 'auto' }}>
                                    {/* Right Side Logic */}
                                    {diffResult.fullDiff.map((part, i) => !part.removed && (
                                        <Box component="span" key={i} sx={{ bgcolor: part.added ? '#e8f5e9' : 'transparent', color: part.added ? '#2e7d32' : 'inherit' }}>
                                            {part.value}
                                        </Box>
                                    ))}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
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