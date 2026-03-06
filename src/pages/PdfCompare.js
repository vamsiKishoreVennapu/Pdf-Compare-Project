import { useState } from 'react';
// import { Header } from '../components/Layout/Header';
import {
  Box, Card, CardContent, Typography, Button, Divider, Paper,
  LinearProgress, Stack, IconButton, Modal, Backdrop, Fade, Grid, Tabs, Tab
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CompareArrows as CompareArrowsIcon,
  NavigateBefore as ArrowBack,
  NavigateNext as ArrowForward,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import pixelmatch from 'pixelmatch';
import * as pdfjsLib from 'pdfjs-dist';
import { diffWordsWithSpace } from 'diff';

const pdfjsVersion = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

export const PdfCompare = () => {
  const [files, setFiles] = useState({ left: null, right: null });
  const [isComparing, setIsComparing] = useState(false);
  const [diffData, setDiffData] = useState([]); // Visual Data (URLs)
  const [extractedData, setExtractedData] = useState({ left: [], right: [] }); // Text per page
  const [diffResult, setDiffResult] = useState(null); // Current page text diff
  const [docSummary, setDocSummary] = useState(null); // Overall stats
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomImg, setZoomImg] = useState(null);
  const [tabValue, setTabValue] = useState(1); // Default to Text Analysis

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleReset = () => {
    setFiles({ left: null, right: null });
    setDiffData([]);
    setExtractedData({ left: [], right: [] });
    setDiffResult(null);
    setDocSummary(null);
    setCurrentPage(0);
    setTabValue(1);
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => (input.value = ""));
  };

  const handleEdit = () => {
    setFiles({ left: null, right: null });
    setDiffData([]);
    setExtractedData({ left: [], right: [] });
    setDiffResult(null);
    setDocSummary(null);
    setCurrentPage(0);
    setTabValue(1);
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => (input.value = ""));
  };

  const extractTextPages = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let pagesText = [];
    const numPages = Math.min(pdf.numPages, 6);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageString = content.items.map(item => item.str).join(' ');
      pagesText.push(pageString);
    }
    return pagesText;
  };

  const getPageImageData = async (pdfDoc, pageNum) => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    return {
      imageData: context.getImageData(0, 0, canvas.width, canvas.height),
      width: canvas.width,
      height: canvas.height,
      url: canvas.toDataURL()
    };
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
  const calculateOverallSummary = (leftPages, rightPages) => {
    let totalChanges = 0;
    let totalMatches = 0;
    const maxPages = Math.max(leftPages.length, rightPages.length);

    for (let i = 0; i < maxPages; i++) {
      const pageDiff = diffWordsWithSpace(leftPages[i] || "", rightPages[i] || "");

      // Use for...of instead of .forEach to avoid no-loop-func warning
      for (const part of pageDiff) {
        if (part.added || part.removed) {
          totalChanges += part.value.length;
        } else {
          totalMatches += part.value.length;
        }
      }
    }

    const totalChars = totalMatches + totalChanges;
    const score = totalChars > 0 ? Math.round((totalMatches / totalChars) * 100) : 0;

    setDocSummary({
      percentage: score,
      totalChangeLength: totalChanges,
      pageCount: maxPages
    });
  };

  const handleFullComparison = async () => {
    setIsComparing(true);
    setDiffData([]);
    setDiffResult(null);

    try {
      // 1. New Text Comparison Logic
      const leftPages = await extractTextPages(files.left);
      const rightPages = await extractTextPages(files.right);
      setExtractedData({ left: leftPages, right: rightPages });
      calculateOverallSummary(leftPages, rightPages);
      generatePageDiff(0, leftPages, rightPages);

      // 2. Visual Comparison Logic
      const leftBuffer = await files.left.arrayBuffer();
      const rightBuffer = await files.right.arrayBuffer();
      const pdf1 = await pdfjsLib.getDocument({ data: leftBuffer }).promise;
      const pdf2 = await pdfjsLib.getDocument({ data: rightBuffer }).promise;
      const pageCount = Math.min(pdf1.numPages, pdf2.numPages, 6);
      const visualResults = [];

      for (let i = 1; i <= pageCount; i++) {
        const img1 = await getPageImageData(pdf1, i);
        const img2 = await getPageImageData(pdf2, i);
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = img1.width;
        diffCanvas.height = img1.height;
        const diffCtx = diffCanvas.getContext('2d');
        const diffImageData = diffCtx.createImageData(img1.width, img1.height);

        pixelmatch(
          img1.imageData.data, img2.imageData.data, diffImageData.data,
          img1.width, img1.height, { threshold: 0.1 }
        );

        diffCtx.putImageData(diffImageData, 0, 0);
        visualResults.push({ original: img1.url, revised: img2.url, diff: diffCanvas.toDataURL() });
      }
      setDiffData(visualResults);
      setCurrentPage(0);

    } catch (error) {
      console.error("Comparison failed", error);
      alert("Error processing PDFs.");
    } finally {
      setIsComparing(false);
    }
  };

  const handlePageChange = (direction) => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);
    generatePageDiff(newPage, extractedData.left, extractedData.right);
  };

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [side]: file }));
      setDiffData([]);
      setDiffResult(null);
      setDocSummary(null);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* <Header /> */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, boxShadow: 1, mt: 4 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
            <UploadButton label={files.left?.name || "Original PDF"} onUpload={(e) => handleFileUpload(e, 'left')} color={files.left ? "success" : "primary"} />
            <CompareArrowsIcon sx={{ color: 'text.disabled' }} />
            <UploadButton label={files.right?.name || "Revised PDF"} onUpload={(e) => handleFileUpload(e, 'right')} color={files.right ? "success" : "primary"} />
            <Button variant="contained" disabled={!files.left || !files.right || isComparing} onClick={handleFullComparison} sx={{ px: 4, height: 40 }}>
              {isComparing ? 'Analyzing...' : 'Compare PDFs'}
            </Button>
            {(files.left || files.right) && (
              <>
                <Button variant="outlined" color="blue" onClick={handleEdit} sx={{ height: 40 }}>Edit</Button>
                <Button variant="outlined" color="error" onClick={handleReset} sx={{ height: 40 }}>Reset</Button>
              </>)}
          </Stack>
        </CardContent>
        {isComparing && <LinearProgress />}
      </Card>

      {/* Tabs appear only when results exist */}
      {docSummary && (
        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label="Text Analysis" value={1} />
          <Tab label="Visual Comparison" value={0} />
        </Tabs>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}  >

          {/* NEW SUMMARY SECTION (Replaces old Text Summary) */}
          {tabValue === 1 && docSummary && (
            <>
              <Typography sx={{ fontWeight: 'bold', ml: 1, paddingBottom: "10px" }}>Summary</Typography>
              <Paper sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa', borderLeft: '6px solid', borderColor: 'primary.main' }}>
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
            </>
          )}

        </Grid>

        <Grid size={{ xs: 4, md: 9 }}>
          {/* TAB 1: NEW TEXT ANALYSIS VIEW */}
          {tabValue === 1 && diffResult && (
            <Box>
              <Grid container spacing={2}>
                <Grid item size={{ xs: 12, md: 6 }} >
                  <Typography variant="overline" sx={{ fontWeight: 'bold', ml: 1 }}>Original</Typography>
                  <Paper variant="outlined" sx={{ p: 2, height: 365, overflow: 'auto', bgcolor: '#fafafa', lineHeight: 1.6 }}>
                    {diffResult.fullDiff.map((part, i) => !part.added && (
                      <Box component="span" key={i} sx={{
                        bgcolor: part.removed ? '#ffebee' : 'transparent',
                        textDecoration: part.removed ? 'line-through' : 'none',
                        color: part.removed ? '#c62828' : 'inherit',
                        display: 'inline'
                      }}>
                        {part.value}
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                  <Typography variant="overline" sx={{ fontWeight: 'bold', ml: 1 }}>Revised</Typography>
                  <Paper variant="outlined" sx={{ p: 2, height: 365, overflow: 'auto', bgcolor: '#fafafa', lineHeight: 1.6 }}>
                    {diffResult.fullDiff.map((part, i) => !part.removed && (
                      <Box component="span" key={i} sx={{
                        bgcolor: part.added ? '#e8f5e9' : 'transparent',
                        color: part.added ? '#2e7d32' : 'inherit',
                        display: 'inline'
                      }}>
                        {part.value}
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
              <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <IconButton onClick={() => handlePageChange('prev')} disabled={currentPage === 0} color="primary">
                  <ArrowBack fontSize="large" />
                </IconButton>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Page {currentPage + 1} of {diffData.length}</Typography>
                <IconButton onClick={() => handlePageChange('next')} disabled={currentPage === diffData.length - 1} color="primary">
                  <ArrowForward fontSize="large" />
                </IconButton>
              </Stack>
            </Box>
          )}
        </Grid>
      </Grid>
      {/* TAB 0: VISUAL ANALYSIS */}
      {tabValue === 0 && diffData.length > 0 && (
        <Box>
          <Grid container spacing={2}>
            {[
              { label: 'Original Content', img: diffData[currentPage].original, color: 'grey.700' },
              { label: 'Revised Content', img: diffData[currentPage].revised, color: 'primary.main' },
              { label: 'Visual Differences', img: diffData[currentPage].diff, color: 'error.main', isDiff: true }
            ].map((pane, idx) => (
              <Grid item size={{ xs: 12, md: 4 }} key={idx}>
                <Card variant="outlined" sx={{ position: 'relative', borderColor: pane.isDiff ? 'error.light' : 'divider' }}>
                  <Box sx={{ p: 1, textAlign: 'center', bgcolor: pane.isDiff ? 'error.lighter' : 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: pane.color }}>{pane.label}</Typography>
                  </Box>
                  <Box sx={{ position: 'relative', p: 1 }}>
                    <IconButton size="small" onClick={() => setZoomImg(pane.img)} sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 2 }}>
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                    <img src={pane.img} alt={pane.label} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
            <IconButton onClick={() => handlePageChange('prev')} disabled={currentPage === 0} color="primary">
              <ArrowBack fontSize="large" />
            </IconButton>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Page {currentPage + 1} of {diffData.length}</Typography>
            <IconButton onClick={() => handlePageChange('next')} disabled={currentPage === diffData.length - 1} color="primary">
              <ArrowForward fontSize="large" />
            </IconButton>
          </Stack>
        </Box>
      )}

      {/* Zoom Modal */}
      <Modal open={!!zoomImg} onClose={() => setZoomImg(null)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={!!zoomImg}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95vw', maxHeight: '95vh', bgcolor: 'background.paper', p: 2, borderRadius: 2, overflow: 'auto' }}>
            <IconButton onClick={() => setZoomImg(null)} sx={{ position: 'fixed', right: 24, top: 24, zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)' }}><CloseIcon /></IconButton>
            <img src={zoomImg} alt="Zoomed View" style={{ width: '100%', height: 'auto' }} />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

const UploadButton = ({ label, onUpload, color }) => (
  <Button component="label" variant="outlined" color={color} startIcon={<CloudUploadIcon />} sx={{ width: 220, textTransform: 'none' }}>
    <Typography noWrap variant="body2">{label}</Typography>
    <input type="file" hidden accept="application/pdf" onChange={onUpload} />
  </Button>
);