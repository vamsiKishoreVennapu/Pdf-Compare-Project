import React, { useState } from 'react';
import { Header } from '../components/Layout/Header';
import {
  Box, Card, CardContent, Typography, Button,
  // Divider, 
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

  return (
    <Box
      sx={{ p: 2 }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', paddingBottom:"50px"}}>
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
            <Button variant="contained" disabled={!files.left || !files.right || isComparing} onClick={runComparison} sx={{ px: 4, height: 40 }}>
              {isComparing ? 'Analyzing...' : 'Compare Pages'}
            </Button>
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

          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
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
    </Box>

  );
};

const UploadButton = ({ label, onUpload, color }) => (
  <Button component="label" variant="outlined" color={color} startIcon={<CloudUploadIcon />} sx={{ width: 220, textTransform: 'none' }}>
    <Typography noWrap variant="body2">{label}</Typography>
    <input type="file" hidden accept="application/pdf" onChange={onUpload} />
  </Button>
);