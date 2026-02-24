import React, { useState } from 'react';
import { Header } from '../components/Layout/Header';
import {
  Box, Card, CardContent, Typography, Button,
  Divider, Paper,
  LinearProgress, Stack, IconButton, Modal, Backdrop, Fade, Grid
} from '@mui/material'; // Imported standard Grid here
import {
  CloudUpload as CloudUploadIcon,
  CompareArrows as CompareArrowsIcon,
  NavigateBefore as ArrowBack,
  NavigateNext as ArrowForward,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon
} from '@mui/icons-material';
// import * as pdfjsLib from 'pdfjs-dist';
import pixelmatch from 'pixelmatch';
import * as pdfjsLib from 'pdfjs-dist';

// Use a stable CDN link instead of a local URL
const pdfjsVersion = '3.11.174'; // Match this to your package.json version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;


// PDF.js worker setup
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url,
// ).toString();

export const PdfCompare = () => {
  const [files, setFiles] = useState({ left: null, right: null });
  const [isComparing, setIsComparing] = useState(false);
  const [diffData, setDiffData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomImg, setZoomImg] = useState(null);

  const handleReset = () => {
    setFiles({ left: null, right: null });
    setDiffData([]);
    setDiffResult(null);
    setCurrentPage(0);
    // Optional: clear file input values manually if needed
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => (input.value = ""));
  };

  const [diffResult, setDiffResult] = useState(null);

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

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [side]: file }));
      setDiffData([]);
    }
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

  const runComparison = async () => {
    setIsComparing(true);
    try {
      const pdf1 = await pdfjsLib.getDocument({ data: await files.left.arrayBuffer() }).promise;
      const pdf2 = await pdfjsLib.getDocument({ data: await files.right.arrayBuffer() }).promise;

      const pageCount = Math.min(pdf1.numPages, pdf2.numPages, 6);
      const results = [];

      for (let i = 1; i <= pageCount; i++) {
        const img1 = await getPageImageData(pdf1, i);
        const img2 = await getPageImageData(pdf2, i);

        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = img1.width;
        diffCanvas.height = img1.height;
        const diffCtx = diffCanvas.getContext('2d');
        const diffImageData = diffCtx.createImageData(img1.width, img1.height);

        pixelmatch(
          img1.imageData.data,
          img2.imageData.data,
          diffImageData.data,
          img1.width,
          img1.height,
          { threshold: 0.1 }
        );

        diffCtx.putImageData(diffImageData, 0, 0);
        results.push({ original: img1.url, revised: img2.url, diff: diffCanvas.toDataURL() });
      }
      setDiffData(results);
      setCurrentPage(0);
    } catch (error) {
      console.error(error);
      alert(`Error processing comparison.\n${error}`);
    } finally {
      setIsComparing(false);
    }
  };

  const runComparison2 = async () => {
    setIsComparing(true);
    try {
      const text1 = await extractText(files.left);
      const text2 = await extractText(files.right);

      // Simple line-by-line comparison logic
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      const added = lines2.filter(line => !lines1.includes(line) && line.trim() !== "");
      const removed = lines1.filter(line => !lines2.includes(line) && line.trim() !== "");

      // Calculate a rough similarity percentage

      const totalLines = Math.max(lines1.length, lines2.length);
      const matches = totalLines - (added.length + removed.length);
      const percentage = Math.max(0, Math.floor((matches / totalLines) * 100));
      setDiffResult({
        matches: `${percentage}%`,
        added,
        removed,
        changes: added.length + removed.length
      });
    } catch (error) {
      console.error("PDF Parsing failed", error);
      alert("Failed to parse PDF. Ensure it's not password protected.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', paddingBottom: "50px" }}>
        <Header />
      </Typography>
      {/* <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Visual PDF Analysis
      </Typography> */}

      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
            <UploadButton label={files.left?.name || "Original PDF"} onUpload={(e) => handleFileUpload(e, 'left')} color={files.left ? "success" : "primary"} />
            <CompareArrowsIcon sx={{ color: 'text.disabled', display: { xs: 'none', sm: 'block' } }} />
            <UploadButton label={files.right?.name || "Revised PDF"} onUpload={(e) => handleFileUpload(e, 'right')} color={files.right ? "success" : "primary"} />
            <Button variant="contained" disabled={!files.left || !files.right || isComparing} onClick={runComparison2} sx={{ px: 4, height: 40 }}>
              {isComparing ? 'Analyzing...' : 'Compare Pages'}
            </Button>
            {(files.left || files.right) && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleReset}
                sx={{ height: 40 }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </CardContent>
        {isComparing && <LinearProgress />}
      </Card>

      {diffData.length > 0 && (
        <Box >
          <Grid container spacing={2}>
            {[
              { label: 'Original Content', img: diffData[currentPage].original, color: 'grey.700' },
              { label: 'Revised Content', img: diffData[currentPage].revised, color: 'primary.main' },
              { label: 'Visual Differences', img: diffData[currentPage].diff, color: 'error.main', isDiff: true }
            ].map((pane, idx) => (
              <Grid item xs={12} md={4} key={idx} width={"350px"}>
                <Card variant="outlined" sx={{ position: 'relative', borderColor: pane.isDiff ? 'error.light' : 'divider' }}>
                  <Box sx={{ p: 1, textAlign: 'center', bgcolor: pane.isDiff ? 'error.lighter' : 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: pane.color }}>
                      {pane.label}
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative', p: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setZoomImg(pane.img)}
                      sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' }, zIndex: 2 }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                    <img src={pane.img} alt={pane.label} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
            <IconButton onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0} color="primary">
              <ArrowBack fontSize="large" />
            </IconButton>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Page {currentPage + 1} of {diffData.length}
            </Typography>
            <IconButton onClick={() => setCurrentPage(prev => Math.min(diffData.length - 1, prev + 1))} disabled={currentPage === diffData.length - 1} color="primary">
              <ArrowForward fontSize="large" />
            </IconButton>
          </Stack>
        </Box>
      )}

      <Modal
        open={!!zoomImg}
        onClose={() => setZoomImg(null)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={!!zoomImg}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95vw', maxHeight: '95vh', bgcolor: 'background.paper', boxShadow: 24, p: 2, borderRadius: 2, outline: 'none', overflow: 'auto'
          }}>
            <IconButton
              onClick={() => setZoomImg(null)}
              sx={{ position: 'fixed', right: 24, top: 24, zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 2 }}
            >
              <CloseIcon />
            </IconButton>
            <img src={zoomImg} alt="Zoomed View" style={{ width: '100%', height: 'auto' }} />
          </Box>
        </Fade>
      </Modal>

      <Grid container spacing={3}>{diffResult && (
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
  <Button component="label" variant="outlined" color={color} startIcon={<CloudUploadIcon />} sx={{ width: 220, textTransform: 'none' }}>
    <Typography noWrap variant="body2">{label}</Typography>
    <input type="file" hidden accept="application/pdf" onChange={onUpload} />
  </Button>
);