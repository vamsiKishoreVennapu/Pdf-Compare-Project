import { useState, useEffect } from 'react';
import { parsePdfToJson } from './PdfParser';

const STORAGE_KEY = 'pdf_layout_data';

export const usePdfStore = (initialDefault) => {
    const [elements, setElements] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Malformed JSON in storage", e);
                return initialDefault;
            }
        }
        return initialDefault; 
    });

    // Auto-save to localStorage whenever elements change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
    }, [elements]);

    const saveToJsonFile = () => {
        const dataStr = "data:text/json;charset=utf-8," + 
            encodeURIComponent(JSON.stringify(elements, null, 2));
        const link = document.createElement('a');
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `design_${Date.now()}.json`);
        link.click();
    };

    const loadFromJsonFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    setElements(json);
                    resolve(json);
                } catch (err) {
                    reject("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        });
    };

    const resetStore = () => {
        if (window.confirm("Reset canvas? This will delete your current progress.")) {
            setElements(initialDefault);
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const handlePdfImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            const newElements = await parsePdfToJson(file);
            setElements(newElements);
        } catch (err) {
            console.error("PDF Parsing failed", err);
            alert("Could not parse this PDF. It might be an image-only scan.");
        }
    }
};
    return {
        elements,
        setElements,
        saveToJsonFile,
        loadFromJsonFile,
        resetStore,
        handlePdfImport
    };
};