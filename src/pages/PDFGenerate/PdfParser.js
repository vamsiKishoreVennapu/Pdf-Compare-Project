import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export const parsePdfToJson = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let allElements = [];

    // We'll use the height of the first page as our standard "Page Height" for offsets
    const firstPage = await pdf.getPage(1);
    const standardViewport = firstPage.getViewport({ scale: 1.0 });
    const pageHeight = standardViewport.height;

    // Loop through all N pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        const pageElements = textContent.items
            .filter(item => item.str.trim().length > 0)
            .map((item, index) => {
                const [fontSize, , , , x, y] = item.transform;

                // Calculate the vertical offset
                // Elements on Page 1: Y starts at 0
                // Elements on Page 2: Y starts at pageHeight, etc.
                const verticalOffset = (i - 1) * pageHeight;

                return {
                    id: `imported-p${i}-${Date.now()}-${index}`,
                    type: 'text',
                    content: item.str,
                    x: x,
                    // New Y: Flip + Page Offset
                    y: (viewport.height - y - fontSize) + verticalOffset,
                    w: item.width || 200,
                    h: fontSize * 1.5,
                    fontSize: fontSize || 12,
                    bold: item.fontName.toLowerCase().includes('bold'),
                    italic: item.fontName.toLowerCase().includes('italic'),
                    color: '#000000',
                    align: 'left',
                    fontFamily: 'Helvetica',
                    rotation: 0,
                    lineHeight: 1.2
                };
            });

        allElements = [...allElements, ...pageElements];
    }

    return allElements;
};