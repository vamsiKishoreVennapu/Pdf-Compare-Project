import React, { useState, useMemo } from 'react';
import {
    Box, Button, Typography, Paper, TextField, Stack,
    // IconButton, Tooltip,
    Divider, ToggleButtonGroup, ToggleButton,
    MenuItem, Select, FormControl, InputLabel, useTheme
} from '@mui/material';
import {
    DeleteForever as DeleteIcon, CloudDownload as DownloadIcon,
    AddPhotoAlternate as ImageIcon, TextFields as TextIcon,
    DragIndicator as DragIcon, FormatBold, FormatItalic,
    FormatAlignLeft, FormatAlignCenter, FormatAlignRight,
} from '@mui/icons-material';
import {
    Document, Page, Text, View, PDFDownloadLink, Image as PdfImage,
    //  Link as PdfLink
} from '@react-pdf/renderer';
import { Rnd } from 'react-rnd';
import { usePdfStore } from './usePdfStore'; // Import the hook

const DEFAULT_LAYOUT = [{
    id: 1, type: 'text', content: 'Welcome!',
    x: 50, y: 50, w: 400, h: 80,
    fontSize: 20, bold: false, italic: false, align: 'left',
    fontFamily: 'Helvetica', rotation: 0
}];

export const PdfGenerate = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const {
        elements,
        setElements,
        saveToJsonFile,
        loadFromJsonFile,
        resetStore,
        handlePdfImport
    } = usePdfStore(DEFAULT_LAYOUT);

    const [selectedId, setSelectedId] = useState(null);
    const selectedElement = elements.find(el => el.id === selectedId);

    const addElement = (type) => {
        const newEl = {
            id: Date.now(),
            type,
            content: type === 'text' ? 'New Text Block' : '',
            x: 50, y: 50,
            w: type === 'image' ? 200 : 300,
            h: type === 'image' ? 200 : 60,
            fontSize: 16, bold: false, italic: false, underline: false,
            color: '#000000', bgColor: 'transparent', align: 'left',
            lineHeight: 1.2, fontFamily: 'Helvetica', src: null, url: '',
            flipX: false, flipY: false, rotation: 0
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const updateElement = (id, updates) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedId(null);
    };

    const handleImageUpload = (e, id) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (upload) => updateElement(id, { src: upload.target.result });
            reader.readAsDataURL(file);
        }
    };
    const totalCanvasHeight = elements.length > 0
        ? Math.max(...elements.map(el => el.y + el.h)) + 100
        : '297mm';

    const PAGE_HEIGHT = 842;

    const pages = useMemo(() => {
        const pageCount = Math.ceil(parseFloat(totalCanvasHeight) / PAGE_HEIGHT);
        const groupedPages = [];

        for (let i = 0; i < pageCount; i++) {
            const pageElements = elements.filter(el =>
                el.y >= i * PAGE_HEIGHT && el.y < (i + 1) * PAGE_HEIGHT
            );
            // Even if a page is empty, we keep it to maintain index/offset
            groupedPages.push(pageElements);
        }
        return groupedPages;
    }, [elements, totalCanvasHeight]);
    return (
        <Box sx={{
            display: 'flex',
            height: 'calc(100vh - 115px)',
            width: '100%',
            overflow: 'hidden',
            bgcolor: isDarkMode ? '#0f172a' : '#f8fafc', // Slate 900 for dark mode
            color: 'text.primary'
        }}>
            {/* CANVAS AREA - The "Dark Studio" */}
            <Box
                id="canvas-container"
                onClick={(e) => e.target.id === 'canvas-container' && setSelectedId(null)}
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundImage: isDarkMode
                        ? 'radial-gradient(#1e293b 1px, transparent 1px)'
                        : 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                <Paper
                    elevation={10}
                    sx={{
                        width: '180mm',
                        // height: '297mm',
                        height: totalCanvasHeight,
                        bgcolor: 'white', // PDF Paper should always be white
                        position: 'relative',
                        background: `linear-gradient(to bottom, 
            transparent ${PAGE_HEIGHT - 1}px, 
            #ef4444 ${PAGE_HEIGHT - 1}px, 
            #ef4444 ${PAGE_HEIGHT}px, 
            transparent ${PAGE_HEIGHT}px)`,
                        backgroundSize: `100% ${PAGE_HEIGHT}px`,
                        flexShrink: 0,
                        mb: 10,
                        boxShadow: isDarkMode ? '0 0 40px rgba(0,0,0,0.6)' : '0 0 20px rgba(0,0,0,0.1)'
                    }}
                >
                    {elements.map((el) => {
                        const isSelected = selectedId === el.id;

                        return (
                            <Rnd
                                key={el.id}
                                size={{ width: el.w, height: el.h }}
                                position={{ x: el.x, y: el.y }}
                                disableDragging={!isSelected}
                                enableResizing={isSelected}
                                onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                                // onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                                onResizeStop={(e, dir, ref, delta, pos) => updateElement(el.id, { w: ref.offsetWidth, h: ref.offsetHeight, ...pos })}
                                dragHandleClassName="drag-handle"
                                bounds="parent"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                }}
                            >
                                <Box sx={{
                                    width: '100%', height: '100%',
                                    outline: selectedId === el.id ? '2px solid #3b82f6' : '1px dashed #cbd5e1',
                                    position: 'relative',
                                    transform: `rotate(${el.rotation}deg)`,
                                    bgcolor: el.type === 'text' ? el.bgColor : 'transparent'
                                }}>
                                    {selectedId === el.id && (
                                        <Box className="drag-handle" sx={{
                                            position: 'absolute', top: -24, left: 0, bgcolor: '#3b82f6', color: 'white',
                                            cursor: 'move', px: 0.5, borderRadius: '4px 4px 0 0', display: 'flex', zIndex: 10
                                        }}><DragIcon fontSize="small" /></Box>
                                    )}

                                    {el.type === 'text' ? (
                                        <TextField
                                            fullWidth multiline variant="standard"
                                            value={el.content}
                                            onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: {
                                                    p: 1, fontSize: el.fontSize, fontWeight: el.bold ? 700 : 400,
                                                    fontStyle: el.italic ? 'italic' : 'normal',
                                                    textDecoration: el.underline ? 'underline' : 'none',
                                                    color: el.color, lineHeight: el.lineHeight,
                                                    fontFamily: el.fontFamily, textAlign: el.align,
                                                    height: '100%',
                                                    '& .MuiInputBase-input': {
                                                        textAlign: el.align,
                                                        // Ensure text editor remains visible against the white paper
                                                        color: el.color
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {el.src ? (
                                                <img src={el.src} style={{
                                                    width: '100%', height: '100%', objectFit: 'contain',
                                                    transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`
                                                }} alt="" />
                                            ) : (
                                                <Button variant="outlined" component="label" size="small">
                                                    Upload <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, el.id)} />
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Rnd>
                        )
                    })}
                </Paper>
            </Box>

            {/* RIGHT SIDEBAR */}
            <Paper
                square
                elevation={0}
                sx={{
                    width: 320,
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    zIndex: 20
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>

                    <Stack spacing={1.5}>

                        <Typography variant="caption" color="text.secondary">JSON Storage</Typography>
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" size="small" onClick={saveToJsonFile}>
                                Export
                            </Button>
                            <Button variant="outlined" size="small" component="label">
                                Import
                                <input
                                    type="file"
                                    hidden
                                    accept=".json"
                                    onChange={(e) => loadFromJsonFile(e.target.files[0])}
                                />
                            </Button>
                            <Button variant="contained" component="label" color="secondary" fullWidth>
                                Import Existing PDF
                                <input type="file" hidden accept=".pdf" onChange={handlePdfImport} />
                            </Button>
                            <Button color="error" size="small" onClick={resetStore}>
                                Reset Design
                            </Button>
                        </Stack>

                        <Divider />

                        <Stack direction="row" spacing={1}>
                            <Button fullWidth variant="outlined" size="small" startIcon={<TextIcon />} onClick={() => addElement('text')}>Text</Button>
                            <Button fullWidth variant="outlined" size="small" startIcon={<ImageIcon />} onClick={() => addElement('image')}>Image</Button>
                        </Stack>

                        <PDFDownloadLink
                            document={
                                <Document>
                                    {pages.map((pageEls, index) => (
                                        <Page key={index} size="A4" style={{ padding: 0 }}>
                                            {pageEls.map(el => (
                                                <View key={el.id} style={{
                                                    position: 'absolute',
                                                    // Subtract the offset so it sits correctly on the individual page
                                                    top: el.y - (index * PAGE_HEIGHT),
                                                    left: el.x,
                                                    width: el.w,
                                                    height: el.h
                                                }}>
                                                    {el.type === 'text' ? (
                                                        <View style={{ textAlign: el.align, backgroundColor: el.bgColor }}>
                                                            <Text style={{
                                                                fontSize: el.fontSize, fontWeight: el.bold ? 'bold' : 'normal',
                                                                fontStyle: el.italic ? 'italic' : 'normal',
                                                                textDecoration: el.underline ? 'underline' : 'none',
                                                                color: el.color, lineHeight: el.lineHeight, fontFamily: el.fontFamily
                                                            }}>{el.content}</Text>
                                                        </View>
                                                    ) : (
                                                        el.src && <PdfImage src={el.src} style={{ width: '100%', height: '100%' }} />
                                                    )}
                                                </View>
                                            ))}
                                        </Page>
                                    ))}
                                </Document>
                            }
                            fileName="design.pdf"
                        >
                            {({ loading }) => (
                                <Button fullWidth variant="contained" color="primary" startIcon={<DownloadIcon />} disabled={loading}>
                                    {loading ? 'Processing...' : 'Export PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </Stack>
                </Box>

                <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>Properties</Typography>
                    {selectedElement ? (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            {selectedElement.type === 'text' ? (
                                <>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Font Family</InputLabel>
                                        <Select value={selectedElement.fontFamily} label="Font Family" onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}>
                                            <MenuItem value="Helvetica">Helvetica</MenuItem>
                                            <MenuItem value="Times-Roman">Times New Roman</MenuItem>
                                            <MenuItem value="Courier">Courier</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Stack direction="row" spacing={1} justifyContent="space-between">
                                        <ToggleButtonGroup size="small" value={[selectedElement.bold && 'bold', selectedElement.italic && 'italic'].filter(Boolean)}>
                                            <ToggleButton value="bold" onClick={() => updateElement(selectedId, { bold: !selectedElement.bold })}><FormatBold /></ToggleButton>
                                            <ToggleButton value="italic" onClick={() => updateElement(selectedId, { italic: !selectedElement.italic })}><FormatItalic /></ToggleButton>
                                        </ToggleButtonGroup>
                                        <ToggleButtonGroup exclusive size="small" value={selectedElement.align} onChange={(e, v) => v && updateElement(selectedId, { align: v })}>
                                            <ToggleButton value="left"><FormatAlignLeft /></ToggleButton>
                                            <ToggleButton value="center"><FormatAlignCenter /></ToggleButton>
                                            <ToggleButton value="right"><FormatAlignRight /></ToggleButton>
                                        </ToggleButtonGroup>
                                    </Stack>

                                    <Stack direction="row" spacing={2}>
                                        <TextField label="Size" type="number" size="small" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) || 12 })} />
                                        <TextField label="Line Height" type="number" size="small" inputProps={{ step: 0.1 }} value={selectedElement.lineHeight} onChange={(e) => updateElement(selectedId, { lineHeight: parseFloat(e.target.value) || 1.2 })} />
                                    </Stack>

                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                                            Colors (Text / Highlight)
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <input
                                                type="color"
                                                value={selectedElement.color}
                                                onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                                                style={{ width: 30, height: 31, border: `1px solid ${theme.palette.divider}`, borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                            />
                                            <input
                                                type="color"
                                                value={selectedElement.bgColor === 'transparent' ? '#ffffff' : selectedElement.bgColor}
                                                onChange={(e) => updateElement(selectedId, { bgColor: e.target.value })}
                                                style={{ width: 30, height: 31, border: `1px solid ${theme.palette.divider}`, borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                            />
                                        </Stack>
                                    </Box>
                                </>
                            ) : (
                                <Stack spacing={1.5}>
                                    <Button fullWidth variant="outlined" onClick={() => updateElement(selectedId, { flipX: !selectedElement.flipX })}>Flip Horizontal</Button>
                                    <Button fullWidth variant="outlined" onClick={() => updateElement(selectedId, { rotation: (selectedElement.rotation + 90) % 360 })}>Rotate 90°</Button>
                                </Stack>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Button fullWidth variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => deleteElement(selectedId)} sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                Remove Element
                            </Button>
                        </Stack>
                    ) : (
                        <Box sx={{ mt: 8, textAlign: 'center', px: 2 }}>
                            <DragIcon sx={{ fontSize: 40, color: 'divider', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Select an element on the canvas to customize its properties.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};