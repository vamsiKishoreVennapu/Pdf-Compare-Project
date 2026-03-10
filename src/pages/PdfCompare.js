import { useState } from 'react';
import { jsPDF } from "jspdf";
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
  const [viewMode, setViewMode] = useState('both');
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

  const handleExport = () => {
    if (!diffData || diffData.length === 0) {
      alert("No diff data available. Please run the comparison first.");
      return;
    }

    // 1. Initialize PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 2. Loop through all analyzed pages
    diffData.forEach((pageData, index) => {
      // Select the image based on the user's current view mode (Both, Added, or Removed)
      const imgToExport = viewMode === 'removed' ? pageData.diffRemoved :
        viewMode === 'added' ? pageData.diffAdded :
          pageData.diff;

      // 3. Add the image to the current page
      pdf.addImage(imgToExport, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // 4. If there's another page coming, add a new blank page to the PDF
      if (index < diffData.length - 1) {
        pdf.addPage();
      }
    });

    // 5. Save the complete document
    pdf.save("full-document-diff.pdf");
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
      // 1. Text Comparison Logic (Remains the same)
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
      const pageCount = Math.min(pdf1.numPages, pdf2.numPages);
      const visualResults = [];

      for (let i = 1; i <= pageCount; i++) {
        const img1 = await getPageImageData(pdf1, i);
        const img2 = await getPageImageData(pdf2, i);

        // Setup Canvases
        const canvas = document.createElement('canvas');
        canvas.width = img1.width;
        canvas.height = img1.height;
        const ctx = canvas.getContext('2d');

        const img1Data = img1.imageData.data;
        const img2Data = img2.imageData.data;

        const generateLayer = (mode) => {
          const diffImageData = ctx.createImageData(img1.width, img1.height);
          const data = diffImageData.data;

          // good one final
          // for (let j = 0; j < img1Data.length; j += 4) {
          //   const r1 = img1Data[j], g1 = img1Data[j + 1], b1 = img1Data[j + 2];
          //   const r2 = img2Data[j], g2 = img2Data[j + 1], b2 = img2Data[j + 2];

          //   const v1 = (r1 + g1 + b1) / 3;
          //   const v2 = (r2 + g2 + b2) / 3;

          //   const isInk1 = v1 < 220;
          //   const isInk2 = v2 < 220;

          //   // Tolerance of 80 to keep things clean and non-muddy
          //   const isIdentical = isInk1 && isInk2 && Math.abs(v1 - v2) < 80;

          //   const removed = isInk1 && !isInk2;
          //   const added = !isInk1 && isInk2;
          //   const overlapConflict = isInk1 && isInk2 && !isIdentical;

          //   if (isIdentical) {
          //     // 1. DIMMED ORIGINAL: Shift toward white by 60%
          //     data[j] = r1 + (255 - r1) * 0.6;
          //     data[j + 1] = g1 + (255 - g1) * 0.6;
          //     data[j + 2] = b1 + (255 - b1) * 0.6;
          //     data[j + 3] = 255;
          //   } else if (overlapConflict && mode === 'both') {
          //     // 1. OVERLAP: Soft Mauve (Solid)
          //     // data[j] = 200; data[j + 1] = 160; data[j + 2] = 200; data[j + 3] = 255;

          //     // data[j] = 0;
          //     // data[j + 1] = 0;
          //     // data[j + 2] = 0;
          //     // data[j + 3] = 0;

          //     // goog combine color ie; same as common text only one which is compatible
          //     data[j] = r1 + (255 - r1) * 0.6;
          //     data[j + 1] = g1 + (255 - g1) * 0.6;
          //     data[j + 2] = b1 + (255 - b1) * 0.6;
          //     data[j + 3] = 255;
          //   } else if (removed && (mode === 'both' || mode === 'removed')) {
          //     // 2. PLAIN LIGHT PINK: (255, 182, 255)
          //     data[j] = 255; data[j + 1] = 182; data[j + 2] = 255; data[j + 3] = 255;
          //   } else if (added && (mode === 'both' || mode === 'added')) {
          //     // 3. PLAIN LIGHT GREEN: (144, 238, 138)
          //     data[j] = 144; data[j + 1] = 238; data[j + 2] = 138; data[j + 3] = 255;
          //   }
          //   else {
          //     // WHITE PAPER
          //     data[j] = 255; data[j + 1] = 255; data[j + 2] = 255; data[j + 3] = 255;
          //   }
          // }


          // for (let j = 0; j < img1Data.length; j += 4) {
          //   const r1 = img1Data[j], g1 = img1Data[j + 1], b1 = img1Data[j + 2];
          //   const r2 = img2Data[j], g2 = img2Data[j + 1], b2 = img2Data[j + 2];

          //   // 1. Strict Ink Detection
          //   const isInk1 = (r1 + g1 + b1) / 3 < 235;
          //   const isInk2 = (r2 + g2 + b2) / 3 < 235;

          //   // 2. ULTRA-STRICT COMMON: If even one channel is slightly off, it's NOT common.
          //   // This ensures the "inside" of a shifted letter isn't marked as gray.
          //   const isTrueCommon = isInk1 && isInk2 &&
          //     Math.abs(r1 - r2) < 5 &&
          //     Math.abs(g1 - g2) < 5 &&
          //     Math.abs(b1 - b2) < 5;

          //   // 3. OVERLAP: Both have ink, but they are not identical pixels.
          //   const overlapConflict = isInk1 && isInk2 && !isTrueCommon;
          //   const removed = isInk1 && !isInk2;
          //   const added = !isInk1 && isInk2;

          //   // --- THE SOLID FILL & TOGGLE LOGIC ---

          //   if (isTrueCommon) {
          //     // UNCHANGED: Always stay dimmed gray
          //     data[j] = r1 + (255 - r1) * 0.6;
          //     data[j + 1] = g1 + (255 - g1) * 0.6;
          //     data[j + 2] = b1 + (255 - b1) * 0.6;
          //     data[j + 3] = 255;
          //   }
          //   else if (mode === 'added') {
          //     // ADDED MODE: Merge Orange + Green into SOLID GREEN
          //     if (added || overlapConflict) {
          //       data[j] = 144; data[j + 1] = 238; data[j + 2] = 138;
          //     } else {
          //       data[j] = 255; data[j + 1] = 255; data[j + 2] = 255;
          //     }
          //     data[j + 3] = 255;
          //   }
          //   else if (mode === 'removed') {
          //     // REMOVED MODE: Merge Orange + Pink into SOLID PINK
          //     if (removed || overlapConflict) {
          //       data[j] = 255; data[j + 1] = 182; data[j + 2] = 255;
          //     } else {
          //       data[j] = 255; data[j + 1] = 255; data[j + 2] = 255;
          //     }
          //     data[j + 3] = 255;
          //   }
          //   else {
          //     // BOTH MODE: Show the diagnostic "Orange Fill"
          //     if (overlapConflict) {
          //       data[j] = 255; data[j + 1] = 165; data[j + 2] = 0; // Solid Orange Fill
          //     } else if (removed) {
          //       data[j] = 255; data[j + 1] = 182; data[j + 2] = 255; // Pink
          //     } else if (added) {
          //       data[j] = 144; data[j + 1] = 238; data[j + 2] = 138; // Green
          //     } else {
          //       data[j] = 255; data[j + 1] = 255; data[j + 2] = 255; // White
          //     }
          //     data[j + 3] = 255;
          //   }
          // }

          for (let j = 0; j < img1Data.length; j += 4) {
            const r1 = img1Data[j], g1 = img1Data[j + 1], b1 = img1Data[j + 2];
            const r2 = img2Data[j], g2 = img2Data[j + 1], b2 = img2Data[j + 2];

            // 1. Strict Ink Detection
            const isInk1 = (r1 + g1 + b1) / 3 < 235;
            const isInk2 = (r2 + g2 + b2) / 3 < 235;

            // 2. ULTRA-STRICT COMMON
            const isTrueCommon = isInk1 && isInk2 &&
              Math.abs(r1 - r2) < 5 &&
              Math.abs(g1 - g2) < 5 &&
              Math.abs(b1 - b2) < 5;

            const overlapConflict = isInk1 && isInk2 && !isTrueCommon;
            const removed = isInk1 && !isInk2;
            const added = !isInk1 && isInk2;

            // rgb(0,204,204)  rgb(204,0,0)

            const myGreen = { r: 0, g: 204, b: 204 };
            const myRed = { r: 204, g: 0, b: 0 };

            // Custom Palette
            // const myGreen = { r: 0, g: 207, b: 187 };
            // const myRed = { r: 234, g: 159, b: 159 };

            // Function to apply the "Dimming" effect consistently
            const applyDimming = () => {
              data[j] = r1 + (255 - r1) * 0.45;
              data[j + 1] = g1 + (255 - g1) * 0.45;
              data[j + 2] = b1 + (255 - b1) * 0.45;
              data[j + 3] = 255;
            };

            if (isTrueCommon) {
              // applyDimming();
              data[j] = r1
              data[j + 1] = g1
              data[j + 2] = b1
              data[j + 3] = 255;
            }
            else if (mode === 'added') {
              if (added || overlapConflict) {
                data[j] = myGreen.r; data[j + 1] = myGreen.g; data[j + 2] = myGreen.b;
              } else {
                data[j] = 255; data[j + 1] = 255; data[j + 2] = 255;
              }
              data[j + 3] = 255;
            }
            else if (mode === 'removed') {
              if (removed || overlapConflict) {
                data[j] = myRed.r; data[j + 1] = myRed.g; data[j + 2] = myRed.b;
              } else {
                data[j] = 255; data[j + 1] = 255; data[j + 2] = 255;
              }
              data[j + 3] = 255;
            }
            else {
              // BOTH MODE: Removed the Orange fill. 
              // Overlaps now look like the common dimmed text.
              if (overlapConflict) {
                applyDimming();
              } else if (removed) {
                data[j] = myRed.r; data[j + 1] = myRed.g; data[j + 2] = myRed.b;
              } else if (added) {
                data[j] = myGreen.r; data[j + 1] = myGreen.g; data[j + 2] = myGreen.b;
              } else {
                data[j] = 255; data[j + 1] = 255; data[j + 2] = 255;
              }
              data[j + 3] = 255;
            }
          }

          ctx.putImageData(diffImageData, 0, 0);
          // return canvas.toDataURL();
          return canvas.toDataURL('image/png');
        };

        visualResults.push({
          original: img1.url,
          revised: img2.url,
          diff: generateLayer('both'),      // X and Y mixed
          diffRemoved: generateLayer('removed'), // Only X (Red)
          diffAdded: generateLayer('added')     // Only Y (Green)
        });
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
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, boxShadow: 1, mt: 0 }}>
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
                <Button variant="outlined" color="error" onClick={handleReset} sx={{ height: 40 }}>Reset</Button>
                <Button variant="outlined" color="blue" onClick={handleExport} sx={{ height: 40 }}>Export</Button>
              </>)}
          </Stack>
        </CardContent>
        {isComparing && <LinearProgress />}
      </Card>

      {/* Tabs appear only when results exist */}
      {/* {docSummary && (
        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label="Text Analysis" value={1} />
          <Tab label="Visual Comparison" value={0} />
        </Tabs>
      )} */}

      {docSummary && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Centers the Tabs
          position: 'relative',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
          px: 2
        }}>
          {/* 1. THE TABS (Centered) */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ minHeight: 48 }}
          >
            <Tab label="Text Analysis" value={1} />
            <Tab label="Visual Comparison" value={0} />
          </Tabs>

          {/* 2. THE TOGGLE BUTTONS (Positioned to the right) */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: 'absolute',
              right: 65,
              display: tabValue === 0 ? 'flex' : 'none' // Only show when Visual Comparison is active
            }}
          >
            <Button
              variant={viewMode === 'both' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('both')}
              size="small"
              sx={{ height: 30, textTransform: 'none' }}
            >
              Both
            </Button>
            <Button
              variant={viewMode === 'removed' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setViewMode('removed')}
              size="small"
              sx={{ height: 30, textTransform: 'none' }}
            >
              Removed
            </Button>
            <Button
              variant={viewMode === 'added' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setViewMode('added')}
              size="small"
              sx={{ height: 30, textTransform: 'none' }}
            >
              Added
            </Button>
          </Stack>
        </Box>
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
                        display: 'inline',
                        fontWeight: part.removed ? 700 : 400,
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
                        // color: part.added ? '#2e7d32' : 'inherit',
                        // bgcolor: part.added ? '#97d89d' : 'transparent',
                        color: part.added ? '#0000a8' : 'inherit',
                        display: 'inline',
                        fontWeight: part.added ? 700 : 400,
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
                    <IconButton
                      size="small"
                      onClick={() => {
                        const activeZoomImg = pane.isDiff
                          ? (viewMode === 'removed' ? diffData[currentPage].diffRemoved :
                            viewMode === 'added' ? diffData[currentPage].diffAdded :
                              diffData[currentPage].diff)
                          : pane.img;

                        setZoomImg(activeZoomImg);
                      }}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        zIndex: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                      }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                    <img
                      src={
                        pane.isDiff
                          ? (viewMode === 'removed' ? diffData[currentPage].diffRemoved :
                            viewMode === 'added' ? diffData[currentPage].diffAdded :
                              diffData[currentPage].diff)
                          : pane.img
                      }
                      alt={pane.label}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
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

      <Modal open={!!zoomImg} onClose={() => setZoomImg(null)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={!!zoomImg}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95vw', maxHeight: '95vh', bgcolor: 'background.paper', p: 2, borderRadius: 2, overflow: 'auto' }}>
            <IconButton onClick={() => setZoomImg(null)} sx={{ position: 'fixed', right: 24, top: 24, zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)' }}><CloseIcon /></IconButton>
            <img
              src={
                (zoomImg === diffData[currentPage]?.diff ||
                  zoomImg === diffData[currentPage]?.diffAdded ||
                  zoomImg === diffData[currentPage]?.diffRemoved)
                  ? (viewMode === 'removed' ? diffData[currentPage].diffRemoved :
                    viewMode === 'added' ? diffData[currentPage].diffAdded :
                      diffData[currentPage].diff)
                  : zoomImg
              }
              alt="Zoomed View"
              style={{ width: '100%', height: 'auto' }}
            />
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