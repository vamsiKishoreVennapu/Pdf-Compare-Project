import { useState } from 'react';
import { Header } from '../components/Layout/Header';
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

const pdfjsVersion = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

export const PdfCompare = () => {
  const [files, setFiles] = useState({ left: null, right: null });
  const [isComparing, setIsComparing] = useState(false);
  const [diffData, setDiffData] = useState([]); // Visual Data
  const [diffResult, setDiffResult] = useState(null); // Text Data
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomImg, setZoomImg] = useState(null);
  const [tabValue, setTabValue] = useState(1); // Default to 1 (Text Analysis)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleReset = () => {
    setFiles({ left: null, right: null });
    setDiffData([]);
    setDiffResult(null);
    setCurrentPage(0);
    setTabValue(1);
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => (input.value = ""));
  };

  const extractText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    const numPages = Math.min(pdf.numPages, 6);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + "\n";
    }
    return fullText;
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

  // Unified Comparison: Runs both Visual and Text analysis
  const handleFullComparison = async () => {
    setIsComparing(true);
    setDiffData([]);
    setDiffResult(null);

    try {
      const leftBuffer = await files.left.arrayBuffer();
      const rightBuffer = await files.right.arrayBuffer();

      // 1. Text Comparison Logic
      const text1 = await extractText(files.left);
      const text2 = await extractText(files.right);
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      const added = lines2.filter(line => !lines1.includes(line) && line.trim() !== "");
      const removed = lines1.filter(line => !lines2.includes(line) && line.trim() !== "");
      const totalLines = Math.max(lines1.length, lines2.length);
      const matches = totalLines - (added.length + removed.length);
      const percentage = Math.max(0, Math.floor((matches / totalLines) * 100));

      setDiffResult({
        matches: `${percentage}%`,
        added,
        removed,
      });

      // 2. Visual Comparison Logic
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

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [side]: file }));
      setDiffData([]);
      setDiffResult(null);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Header />

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
              <Button variant="outlined" color="error" onClick={handleReset} sx={{ height: 40 }}>Reset</Button>
            )}
          </Stack>
        </CardContent>
        {isComparing && <LinearProgress />}
      </Card>

      {/* Tabs appear only when results exist */}
      {(diffData.length > 0 || diffResult) && (
        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label="Text Analysis" value={1} />
          <Tab label="Visual Comparison" value={0} />
        </Tabs>
      )}

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
                {/* <Grid item xs={12} md={4} key={idx}> */}
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
            <IconButton onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0} color="primary">
              <ArrowBack fontSize="large" />
            </IconButton>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Page {currentPage + 1} of {diffData.length}</Typography>
            <IconButton onClick={() => setCurrentPage(prev => Math.min(diffData.length - 1, prev + 1))} disabled={currentPage === diffData.length - 1} color="primary">
              <ArrowForward fontSize="large" />
            </IconButton>
          </Stack>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* TAB 1: TEXT ANALYSIS */}
        {tabValue === 1 && diffResult && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Text Summary</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h3" color={parseInt(diffResult.matches) > 80 ? "success.main" : "warning.main"}>
                    {diffResult.matches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Similarity Score</Typography>
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
                  <Typography variant="h6" gutterBottom>Detailed Changes</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                    {diffResult.added.length === 0 && diffResult.removed.length === 0 ? (
                      <Typography color="text.secondary">No text differences detected.</Typography>
                    ) : (
                      <>
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
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

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