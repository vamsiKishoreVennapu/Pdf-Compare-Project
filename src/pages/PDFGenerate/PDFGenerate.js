import React, { useState } from 'react';
import {
    Box, Button, Typography, Paper, TextField, Stack,
    IconButton, Divider, ToggleButtonGroup, ToggleButton,
    Tooltip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
    DeleteForever as DeleteIcon, CloudDownload as DownloadIcon,
    AddPhotoAlternate as ImageIcon, TextFields as TextIcon,
    DragIndicator as DragIcon, FormatBold, FormatItalic,
    FormatAlignLeft, FormatAlignCenter, FormatAlignRight,
} from '@mui/icons-material';
import { Document, Page, Text, View, PDFDownloadLink, Image as PdfImage, Link as PdfLink } from '@react-pdf/renderer';
import { Rnd } from 'react-rnd';

export const PdfGenerate = () => {
    const [elements, setElements] = useState([
        {
            id: 1, type: 'text', content: 'Welcome! Start composing your PDF.',
            x: 50, y: 50, w: 400, h: 80,
            fontSize: 20, bold: false, italic: false, underline: false,
            color: '#000000', bgColor: 'transparent', align: 'left',
            lineHeight: 1.2, fontFamily: 'Helvetica', url: '',
            flipX: false, flipY: false, rotation: 0
        },
    ]);
    const [selectedId, setSelectedId] = useState(null);
    const selectedElement = elements.find(el => el.id === selectedId);

    // --- ACTIONS (Unchanged Functionality) ---
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

    return (
        <Box sx={{
            display: 'flex',
            height: 'calc(100vh - 115px)',
            // mt: -1,
            overflow: 'hidden'
        }}>
            <Box
                id="canvas-container"
                onClick={(e) => e.target.id === 'canvas-container' && setSelectedId(null)}
                sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#f8fafc' }}
            >
                <Paper
                    elevation={4}
                    sx={{ width: '180mm', height: '297mm', bgcolor: 'white', position: 'relative', flexShrink: 0 }}
                >
                    {elements.map((el) => (
                        <Rnd
                            key={el.id}
                            size={{ width: el.w, height: el.h }}
                            position={{ x: el.x, y: el.y }}
                            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                            onResizeStop={(e, dir, ref, delta, pos) => updateElement(el.id, { w: ref.offsetWidth, h: ref.offsetHeight, ...pos })}
                            dragHandleClassName="drag-handle"
                            bounds="parent"
                            onMouseDown={() => setSelectedId(el.id)}
                        >
                            <Box sx={{
                                width: '100%', height: '100%',
                                outline: selectedId === el.id ? '2px solid #3b82f6' : '1px dashed #cbd5e1',
                                position: 'relative',
                                transform: `rotate(${el.rotation}deg)`
                            }}>
                                {selectedId === el.id && (
                                    <Box className="drag-handle" sx={{
                                        position: 'absolute', top: -24, left: 0, bgcolor: '#3b82f6', color: 'white',
                                        cursor: 'move', px: 0.5, borderRadius: '4px 4px 0 0', display: 'flex'
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
                                                '& .MuiInputBase-input': { textAlign: el.align, backgroundColor: el.bgColor }
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
                    ))}
                </Paper>
            </Box>

            {/* RIGHT SIDEBAR: Actions + Properties */}
            <Paper square sx={{ width: 300, borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>

                {/* NEW PLACEMENT FOR EXPORT & ADD BUTTONS */}
                <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1}>
                            <Button fullWidth variant="outlined" size="small" startIcon={<TextIcon />} onClick={() => addElement('text')}>Add Text</Button>
                            <Button fullWidth variant="outlined" size="small" startIcon={<ImageIcon />} onClick={() => addElement('image')}>Add Image</Button>
                        </Stack>

                        <PDFDownloadLink
                            document={
                                <Document>
                                    <Page size="A4" style={{ padding: 0 }}>
                                        {elements.map(el => (
                                            <View key={el.id} style={{
                                                position: 'absolute', top: el.y, left: el.x, width: el.w, height: el.h,
                                                transform: `rotate(${el.rotation || 0}deg)`
                                            }}>
                                                {el.type === 'text' ? (
                                                    <View style={{ textAlign: el.align }}>
                                                        {el.url ? (
                                                            <PdfLink src={el.url} style={{ textDecoration: 'none' }}>
                                                                <Text style={{
                                                                    fontSize: el.fontSize, fontWeight: el.bold ? 'bold' : 'normal',
                                                                    fontStyle: el.italic ? 'italic' : 'normal',
                                                                    textDecoration: el.underline ? 'underline' : 'none',
                                                                    color: el.color, backgroundColor: el.bgColor,
                                                                    lineHeight: el.lineHeight, fontFamily: el.fontFamily
                                                                }}>{el.content}</Text>
                                                            </PdfLink>
                                                        ) : (
                                                            <Text style={{
                                                                fontSize: el.fontSize, fontWeight: el.bold ? 'bold' : 'normal',
                                                                fontStyle: el.italic ? 'italic' : 'normal',
                                                                textDecoration: el.underline ? 'underline' : 'none',
                                                                color: el.color, backgroundColor: el.bgColor,
                                                                lineHeight: el.lineHeight, fontFamily: el.fontFamily
                                                            }}>{el.content}</Text>
                                                        )}
                                                    </View>
                                                ) : (
                                                    el.src && <PdfImage src={el.src} style={{ width: '100%', height: '100%' }} />
                                                )}
                                            </View>
                                        ))}
                                    </Page>
                                </Document>
                            }
                            fileName="design.pdf"
                        >
                            {({ loading }) => (
                                <Button fullWidth variant="contained" color="primary" startIcon={<DownloadIcon />} disabled={loading}>
                                    {loading ? 'Generating...' : 'Export PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </Stack>
                </Box>

                {/* PROPERTIES SECTION */}
                <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Properties</Typography>
                    {selectedElement ? (
                        <Stack spacing={2.5}>
                            {selectedElement.type === 'text' ? (
                                <>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Font</InputLabel>
                                        <Select value={selectedElement.fontFamily} label="Font" onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}>
                                            <MenuItem value="Helvetica">Helvetica</MenuItem>
                                            <MenuItem value="Times-Roman">Times New Roman</MenuItem>
                                            <MenuItem value="Courier">Courier</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Stack direction="row" spacing={1}>
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
                                        <TextField label="Size" type="number" size="small" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })} />
                                        <TextField label="Space" type="number" size="small" inputProps={{ step: 0.1 }} value={selectedElement.lineHeight} onChange={(e) => updateElement(selectedId, { lineHeight: parseFloat(e.target.value) })} />
                                    </Stack>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                                            Color & Highlight
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Tooltip title="Text Color" arrow>
                                                <input
                                                    type="color"
                                                    value={selectedElement.color}
                                                    onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                                                    style={{
                                                        width: 30, height: 35, border: '1px solid #e2e8f0',
                                                        borderRadius: '6px', cursor: 'pointer', padding: 0,
                                                        backgroundColor: 'white'
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Background Color" arrow>
                                                <input
                                                    type="color"
                                                    value={selectedElement.bgColor === 'transparent' ? '#ffffff' : selectedElement.bgColor}
                                                    onChange={(e) => updateElement(selectedId, { bgColor: e.target.value })}
                                                    style={{
                                                        width: 30, height: 35, border: '1px solid #e2e8f0',
                                                        borderRadius: '6px', cursor: 'pointer', padding: 0,
                                                        backgroundColor: 'white'
                                                    }}
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                </>
                            ) : (
                                <Stack spacing={1}>
                                    <Button variant="outlined" onClick={() => updateElement(selectedId, { flipX: !selectedElement.flipX })}>Flip Horizontal</Button>
                                    <Button variant="outlined" onClick={() => updateElement(selectedId, { rotation: (selectedElement.rotation + 90) % 360 })}>Rotate 90°</Button>
                                </Stack>
                            )}
                            <Divider />
                            <Button fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => deleteElement(selectedId)}>Delete</Button>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                            Select an item to edit
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};