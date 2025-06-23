
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Order, TradingAccountRow } from '../types';
import { normalizeHeader } from '../services/fileHandler'; 

// --- SVG Icons ---
const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.297.266M6.937 9.043c.626-.169 1.282-.296 1.968-.376M14.063 9.043c.626-.169 1.282-.296 1.968-.376" />
    </svg>
);
const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
    </svg>
);
const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m15 0h-1.5m-1.5 0a.75.75 0 01.75.75 2.25 2.25 0 01-2.25 2.25m0-13.5A2.25 2.25 0 0012 3V1.5m0 19.5V18.75m0 0a2.25 2.25 0 00-2.25-2.25m0 13.5A2.25 2.25 0 0112 21V22.5m4.5-9.75h1.5m-19.5 0h1.5m1.5 0a.75.75 0 01-.75-.75A2.25 2.25 0 013.75 9m0 13.5A2.25 2.25 0 006 18.75v-1.5m0-13.5V6A2.25 2.25 0 003.75 3V1.5" />
  </svg>
);
// --- End SVG Icons ---

const LOCAL_STORAGE_KEY = 'tradingAccountRows_v1';
const TRADING_ACCOUNT_SAVED_FORMAT_FILENAME_KEY = 'tradingAccountSavedFormatFilename';
const TRADING_ACCOUNT_CUSTOM_HEADERS_KEY = 'tradingAccountCustomHeaders_v1';


interface TradingAccountPageProps {
  orders: Order[];
}

// For "Upload Basic Excel"
const tradingInputHeaderMap: { [key: string]: keyof Pick<TradingAccountRow, 'inputBonhoefferCode' | 'inputQty' | 'inputCurrentUnitPrice'> } = {
    bonhoeffercode: 'inputBonhoefferCode', bcode: 'inputBonhoefferCode', itemcode: 'inputBonhoefferCode', productcode: 'inputBonhoefferCode', code: 'inputBonhoefferCode',
    qty: 'inputQty', quantity: 'inputQty',
    currentunitprice: 'inputCurrentUnitPrice', currentprice: 'inputCurrentUnitPrice', unitprice: 'inputCurrentUnitPrice', sellprice: 'inputCurrentUnitPrice', saleprice: 'inputCurrentUnitPrice',
};

// For "Upload Full Trading Format Excel"
const fullTradingFormatHeaderMap: { [key: string]: keyof TradingAccountRow | 'currentTotalAlias' | 'supplierTotalAlias' | 'gpUsdAlias' | 'gpPercentageAlias' } = {
    product: 'productName', bonhoeffercode: 'inputBonhoefferCode', qty: 'inputQty', currentunitprice: 'inputCurrentUnitPrice',
    currenttotal: 'currentTotalAlias', // Alias for mapping
    supplier: 'supplierName', priceinusdunitprice: 'supplierUnitPriceUSD', supplierpriceusd: 'supplierUnitPriceUSD',
    suppliertotal: 'supplierTotalAlias', // Alias for mapping
    gc: 'gpUsdAlias', // Alias for mapping
    grossprofit: 'gpUsdAlias', // Alias for mapping
    gppercentage: 'gpPercentageAlias', // Alias for mapping
    gp: 'gpPercentageAlias', // Alias for mapping (can be ambiguous, ensure correct data in Excel)
};

// This map defines how TradingAccountRow fields can be ALIASED in custom templates (uploaded via "Manage Custom Export Format").
// The keys are the actual properties of TradingAccountRow.
// The values are arrays of NORMALIZED (lowercase, no special chars) header texts that a user might use in their template.
const tradingAccountRowToPossibleHeadersMap: { [key in keyof TradingAccountRow]: string[] } = {
    id: ['id', 'identifier', 'rowid'],
    inputBonhoefferCode: ['bonhoeffercode', 'bcode', 'itemcode', 'code', 'productcode', 'bonhoeffer code'],
    inputQty: ['qty', 'quantity'],
    inputCurrentUnitPrice: ['currentunitprice', 'unitprice', 'sellprice', 'saleprice', 'current price', 'current unit price'],
    productName: ['product', 'productname', 'itemname', 'description', 'product details'], // Added 'product details'
    currentTotalPrice: ['currenttotal', 'totalsell', 'totalcurrentprice', 'current value', 'current total value', 'total sale'],
    supplierName: ['supplier', 'suppliername', 'vendor', 'supplier partner'], // Added 'supplier partner'
    supplierUnitPriceUSD: ['supplierunitpriceusd', 'priceinusdunitprice', 'purchaseprice', 'supplierprice', 'supplierunitprice', 'purches price in usd', 'price in usd', 'price in usd unit price', 'purchase cost unit', 'purchase cost (unit)'],
    supplierTotalPriceUSD: ['suppliertotal', 'totalpurchase', 'totalsupplierprice', 'supplier value', 'total price in usd', 'supplier total value', 'total purchase'],
    gpUSD: ['gpusd', 'gc', 'grossprofit', 'grossprofitusd', 'gp in usd', 'gross profit'],
    gpPercentage: ['gppercentage', 'gp%', 'gpin%', 'gp %', 'margin %'],
};

interface PreviewCellStyle {
  fontWeight?: 'bold' | 'normal';
  color?: string;
  backgroundColor?: string;
  minWidth?: string;
  textAlign?: 'left' | 'right' | 'center';
}

interface PreviewMergedCellInfo {
  s: { r: number; c: number }; // start
  e: { r: number; c: number }; // end
}


const TradingAccountPage: React.FC<TradingAccountPageProps> = ({ orders }) => {
    const [rows, setRows] = useState<TradingAccountRow[]>([]);
    const [bonhoefferCodeInput, setBonhoefferCodeInput] = useState('');
    const [qtyInput, setQtyInput] = useState('');
    const [currentUnitPriceInput, setCurrentUnitPriceInput] = useState('');
    
    const [isLoading, setIsLoading] = useState(false); 
    const [basicFileProcessingLoading, setBasicFileProcessingLoading] = useState(false); 
    const [fullFormatFileProcessingLoading, setFullFormatFileProcessingLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [formatFileProcessingLoading, setFormatFileProcessingLoading] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const [showExportChoiceModal, setShowExportChoiceModal] = useState(false);
    
    // Preview State
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewActualHeaderRow1Content, setPreviewActualHeaderRow1Content] = useState<string[] | null>(null); // For 2-row headers
    const [previewHeaders, setPreviewHeaders] = useState<string[]>([]); // Mapping headers (template's 2nd row or 1st row, or default)
    const [previewRowsData, setPreviewRowsData] = useState<any[][]>([]); // Data rows for preview
    const [previewFormatType, setPreviewFormatType] = useState<'TradingAccountFormat' | 'SimpleFormat' | null>(null);
    const [previewFileName, setPreviewFileName] = useState('');
    const [previewModalNote, setPreviewModalNote] = useState<string>(''); 
    const [previewHeaderRowStyles, setPreviewHeaderRowStyles] = useState<Array<Array<PreviewCellStyle | null>>>([]);
    const [previewMergedCellsInfo, setPreviewMergedCellsInfo] = useState<PreviewMergedCellInfo[]>([]);
    const [previewColWidthsInfo, setPreviewColWidthsInfo] = useState<{ wch: number }[] | null>(null);


    const [savedFormatFileName, setSavedFormatFileName] = useState<string | null>(null);
    const [customTradingFormatHeaders, setCustomTradingFormatHeaders] = useState<string[] | null>(null); // Text headers (from template's 1st or 2nd row)
    const [customFormatTemplateSheet, setCustomFormatTemplateSheet] = useState<any | null>(null); // Raw sheet for styling (session only)

    const bonhoefferCodeInputRef = useRef<HTMLInputElement>(null);
    const basicFileInputRef = useRef<HTMLInputElement>(null);
    const fullFormatFileInputRef = useRef<HTMLInputElement>(null);
    const formatTemplateFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const storedRows = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedRows) setRows(JSON.parse(storedRows));

            const storedFormatFile = localStorage.getItem(TRADING_ACCOUNT_SAVED_FORMAT_FILENAME_KEY);
            if (storedFormatFile) setSavedFormatFileName(storedFormatFile);

            const storedCustomHeaders = localStorage.getItem(TRADING_ACCOUNT_CUSTOM_HEADERS_KEY);
            if (storedCustomHeaders) setCustomTradingFormatHeaders(JSON.parse(storedCustomHeaders));
        } catch (e) {
            console.error("Failed to load data from localStorage:", e);
            setError("Could not load saved data. Starting fresh.");
        }
    }, []);

    useEffect(() => {
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows)); } 
        catch (e) { console.error("Failed to save trading account rows to localStorage:", e); }
    }, [rows]);

    useEffect(() => {
        if (savedFormatFileName) localStorage.setItem(TRADING_ACCOUNT_SAVED_FORMAT_FILENAME_KEY, savedFormatFileName);
        else localStorage.removeItem(TRADING_ACCOUNT_SAVED_FORMAT_FILENAME_KEY);
    }, [savedFormatFileName]);

    useEffect(() => {
        if (customTradingFormatHeaders) localStorage.setItem(TRADING_ACCOUNT_CUSTOM_HEADERS_KEY, JSON.stringify(customTradingFormatHeaders));
        else localStorage.removeItem(TRADING_ACCOUNT_CUSTOM_HEADERS_KEY);
    }, [customTradingFormatHeaders]);
    
    useEffect(() => { if (successMessage) { const timer = setTimeout(() => setSuccessMessage(null), 9000); return () => clearTimeout(timer); } }, [successMessage]);
    useEffect(() => { if (error) { const timer = setTimeout(() => setError(null), 9000); return () => clearTimeout(timer); } }, [error]);

    const processAndAddRow = useCallback((
        inputCode: string, inputQty: number, inputCurrentUnitPrice: number,
        providedProductName?: string, providedSupplierName?: string, providedSupplierUnitPriceUSD?: number,
        providedCurrentTotalPrice?: number, providedSupplierTotalPriceUSD?: number, providedGpUSD?: number, providedGpPercentage?: string
    ): TradingAccountRow => {
        const logPreamble = `[ProcessAddRow] Code='${inputCode}' -`;
        console.log(`${logPreamble} Start. Orders available: ${orders ? orders.length : 'undefined'}`);
        const normalizedInputCode = String(inputCode || '').toLowerCase().trim();
        
        let productName = providedProductName;
        if (productName === undefined) {
            if (orders && orders.length > 0) {
                const productOrder = orders.find(o => o.bonhoefferCode && String(o.bonhoefferCode || '').toLowerCase().trim() === normalizedInputCode);
                productName = productOrder ? productOrder.product : "Unknown Product";
                console.log(`${logPreamble} Product Lookup: ${productOrder ? 'Found' : 'Not Found'} -> '${productName}'`);
            } else {
                productName = "Unknown Product";
                console.log(`${logPreamble} Product Lookup: No orders data or product provided.`);
            }
        }

        let supplierName = providedSupplierName;
        let supplierPriceUSD = providedSupplierUnitPriceUSD;
        if (supplierName === undefined || supplierPriceUSD === undefined) {
            if (orders && orders.length > 0) {
                const supplierOrders = orders.filter(o => 
                    o.bonhoefferCode && String(o.bonhoefferCode || '').toLowerCase().trim() === normalizedInputCode && 
                    o.supplier && typeof o.priceInUSD === 'number'
                );
                if (supplierOrders.length > 0) {
                    const bestSupplierOrder = supplierOrders.reduce((best, current) => (current.priceInUSD < best.priceInUSD) ? current : best);
                    if(supplierName === undefined) supplierName = bestSupplierOrder.supplier;
                    if(supplierPriceUSD === undefined) supplierPriceUSD = bestSupplierOrder.priceInUSD;
                    console.log(`${logPreamble} Supplier Lookup: Found Best -> Supplier='${supplierName}', Price='${supplierPriceUSD}'`);
                } else {
                    if(supplierName === undefined) supplierName = "N/A";
                    if(supplierPriceUSD === undefined) supplierPriceUSD = 0;
                    console.log(`${logPreamble} Supplier Lookup: No matching supplier orders.`);
                }
            } else {
                 if(supplierName === undefined) supplierName = "N/A";
                 if(supplierPriceUSD === undefined) supplierPriceUSD = 0;
                 console.log(`${logPreamble} Supplier Lookup: No orders data or supplier details provided.`);
            }
        }

        const finalQty = isNaN(inputQty) ? 0 : inputQty;
        const finalCurrentUnitPrice = isNaN(inputCurrentUnitPrice) ? 0 : inputCurrentUnitPrice;
        const finalSupplierPriceUSD = isNaN(supplierPriceUSD as number) ? 0 : supplierPriceUSD as number;

        const calculatedCurrentTotalPrice = finalQty * finalCurrentUnitPrice;
        const calculatedSupplierTotalPriceUSD = finalQty * finalSupplierPriceUSD;
        const calculatedGpUSD = calculatedCurrentTotalPrice - calculatedSupplierTotalPriceUSD;
        const calculatedGpPercentage = calculatedCurrentTotalPrice !== 0 ? `${((calculatedGpUSD / calculatedCurrentTotalPrice) * 100).toFixed(2)}%` : "0.00%";
        
        const newRow: TradingAccountRow = {
            id: crypto.randomUUID(), inputBonhoefferCode: inputCode, inputQty: finalQty, inputCurrentUnitPrice: finalCurrentUnitPrice, productName: productName || "Unknown Product",
            currentTotalPrice: typeof providedCurrentTotalPrice === 'number' && !isNaN(providedCurrentTotalPrice) ? providedCurrentTotalPrice : calculatedCurrentTotalPrice,
            supplierName: supplierName || "N/A", supplierUnitPriceUSD: finalSupplierPriceUSD,
            supplierTotalPriceUSD: typeof providedSupplierTotalPriceUSD === 'number' && !isNaN(providedSupplierTotalPriceUSD) ? providedSupplierTotalPriceUSD : calculatedSupplierTotalPriceUSD,
            gpUSD: typeof providedGpUSD === 'number' && !isNaN(providedGpUSD) ? providedGpUSD : calculatedGpUSD,
            gpPercentage: typeof providedGpPercentage === 'string' ? providedGpPercentage : calculatedGpPercentage,
        };
        console.log(`${logPreamble} Final Row:`, newRow);
        return newRow;
    }, [orders]);

    const handleAddManualEntry = useCallback(() => { 
        setError(null); setSuccessMessage(null);
        const code = bonhoefferCodeInput.trim();
        const qtyVal = parseFloat(qtyInput);
        const priceVal = parseFloat(currentUnitPriceInput);
        if (!code) { setError("Bonhoeffer Code is required."); return; }
        if (isNaN(qtyVal) || qtyVal <= 0) { setError("Quantity must be a positive number."); return; }
        if (isNaN(priceVal) || priceVal < 0) { setError("Current Unit Price must be a non-negative number."); return; } 
        setIsLoading(true);
        try {
            const newRow = processAndAddRow(code, qtyVal, priceVal);
            setRows(prevRows => [newRow, ...prevRows]);
            setSuccessMessage(`Entry for "${code}" added successfully.`);
            setBonhoefferCodeInput(''); setQtyInput(''); setCurrentUnitPriceInput('');
            if (bonhoefferCodeInputRef.current) bonhoefferCodeInputRef.current.focus();
        } catch (e: any) { setError("Failed to add entry: " + e.message); } 
        finally { setIsLoading(false); }
    }, [bonhoefferCodeInput, qtyInput, currentUnitPriceInput, processAndAddRow]);
    
    const handleRemoveRow = useCallback((idToRemove: string) => { 
        setRows(prevRows => prevRows.filter(row => row.id !== idToRemove));
        setSuccessMessage("Entry removed successfully.");
    }, []);

    const openExportChoiceModal = () => { 
        if (rows.length === 0) { setError("No data to export."); return; }
        setShowExportChoiceModal(true);
    };
    
    const exportAsTradingAccountFormat = useCallback(() => {
        setIsExporting(true); setError(null);
        let exportSuccessMessage = "";
        let finalUnmappedHeadersForMessage: string[] = [];
        const logPreamble = "[Export TA Format]";
        console.log(`${logPreamble} Starting export. Rows count: ${rows.length}.`);
        
        let exportPathTaken = "Unknown";
        if (customFormatTemplateSheet && customTradingFormatHeaders && customTradingFormatHeaders.length > 0) {
            exportPathTaken = "Full Custom (Template Sheet Active)";
        } else if (customTradingFormatHeaders && customTradingFormatHeaders.length > 0) {
            exportPathTaken = "Text-Only Custom Headers (Template Sheet INACTIVE)";
        } else {
            exportPathTaken = "Default Trading Account Format";
        }
        console.log(`${logPreamble} Determined Export Path: ${exportPathTaken}.`);
        console.log(`${logPreamble} Custom template sheet object is ${customFormatTemplateSheet ? 'ACTIVE' : 'INACTIVE'}.`);
        console.log(`${logPreamble} Custom text headers (from localStorage/template upload):`, customTradingFormatHeaders);


        try {
            const XLSX = window.XLSX;
            if (!XLSX) throw new Error("XLSX library not loaded.");
            const newWorkbook = XLSX.utils.book_new();
            let newWorksheet: any = {}; 
            
            const defaultHeaders = ['Product', 'Bonhoeffer Code', 'Qty', 'Current Unit Price', 'Current Total', 
                                   'Supplier', 'Price in USD Unit Price', 'Supplier Total', 'GC', 'GP%'];
            const defaultHeaderStyle = { font: { bold: true, color: { rgb: "FFFFFFFF" } }, fill: { fgColor: { rgb: "FF2E4053" } } }; // Dark Slate Blue
            
            let headersForDataMapping: string[] = defaultHeaders;
            let dataStartExcelRow = 2; // Excel row number (1-indexed)
            let templateHeaderRowCount = 1; // How many rows from template to copy for header (1 or 2)

            if (customFormatTemplateSheet && customTradingFormatHeaders && customTradingFormatHeaders.length > 0) {
                console.log(`${logPreamble} Using custom template sheet for export structure and styling.`);
                headersForDataMapping = customTradingFormatHeaders; // These are from template's 1st or 2nd row
                
                const sheetDataArrayForHeaderCount: any[][] = XLSX.utils.sheet_to_json(customFormatTemplateSheet, { header: 1, defval: null });
                if (sheetDataArrayForHeaderCount.length >= 2 && sheetDataArrayForHeaderCount[1] && sheetDataArrayForHeaderCount[1].some(cell => String(cell ?? '').trim() !== '')) {
                    templateHeaderRowCount = 2; // Template has 2 header rows
                }
                dataStartExcelRow = templateHeaderRowCount + 1;
                console.log(`${logPreamble} Detected ${templateHeaderRowCount} header row(s) in template. Data will start at Excel row ${dataStartExcelRow}.`);
                console.log(`${logPreamble} Headers for data mapping (from template's ${templateHeaderRowCount === 2 ? '2nd' : '1st'} row):`, headersForDataMapping);

                const templateRange = customFormatTemplateSheet['!ref'] ? XLSX.utils.decode_range(customFormatTemplateSheet['!ref']) : {s:{r:0,c:0}, e:{r:0,c:0}};
                const maxColToCopyInHeader = Math.max(templateRange.e.c, headersForDataMapping.length - 1);

                // Copy header rows (1 or 2) from template sheet to new worksheet, preserving values and styles
                for (let R = 0; R < templateHeaderRowCount; ++R) {
                    for (let C = 0; C <= maxColToCopyInHeader; ++C) {
                        const cellAddressInTemplate = XLSX.utils.encode_cell({r:R, c:C});
                        const cellFromTemplate = customFormatTemplateSheet[cellAddressInTemplate];
                        if (cellFromTemplate) {
                            // Deep copy cell, especially the style object 's'
                            const newCell: any = { v: cellFromTemplate.v, t: cellFromTemplate.t };
                            if (cellFromTemplate.s) newCell.s = JSON.parse(JSON.stringify(cellFromTemplate.s)); // Deep copy style
                            if (cellFromTemplate.f) newCell.f = cellFromTemplate.f; // Formula
                            if (cellFromTemplate.l) newCell.l = JSON.parse(JSON.stringify(cellFromTemplate.l)); // Hyperlink
                            if (cellFromTemplate.c) newCell.c = JSON.parse(JSON.stringify(cellFromTemplate.c)); // Comment
                            newWorksheet[cellAddressInTemplate] = newCell;
                        }
                    }
                }
                console.log(`${logPreamble} Header rows (values & styles) copied from template. Rows copied: ${templateHeaderRowCount}. Max col index copied: ${maxColToCopyInHeader}`);

                // Copy column widths and merges from template
                if (customFormatTemplateSheet['!cols']) newWorksheet['!cols'] = JSON.parse(JSON.stringify(customFormatTemplateSheet['!cols']));
                if (customFormatTemplateSheet['!merges']) newWorksheet['!merges'] = JSON.parse(JSON.stringify(customFormatTemplateSheet['!merges']));
                
                exportSuccessMessage = `Data exported using custom format from "${savedFormatFileName || 'template'}" (styling active for this session).`;

            } else if (customTradingFormatHeaders && customTradingFormatHeaders.length > 0) { // Fallback to text headers if sheet not active
                console.log(`${logPreamble} Using custom TEXT headers (template sheet not active). Default styling applied to headers.`);
                headersForDataMapping = customTradingFormatHeaders;
                headersForDataMapping.forEach((header, colIndex) => { // Apply default style to these headers
                    const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: 0});
                    newWorksheet[cellAddress] = {v: header, t:'s', s: JSON.parse(JSON.stringify(defaultHeaderStyle))};
                });
                templateHeaderRowCount = 1; // Only one row of text headers
                dataStartExcelRow = 2;
                exportSuccessMessage = "Data exported using saved custom headers with default styling (template styling not active for this session).";
            } else { // Default format
                console.log(`${logPreamble} Using default TA format headers with default styling.`);
                headersForDataMapping.forEach((header, colIndex) => {
                    const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: 0});
                    newWorksheet[cellAddress] = {v: header, t:'s', s: JSON.parse(JSON.stringify(defaultHeaderStyle))};
                });
                templateHeaderRowCount = 1;
                dataStartExcelRow = 2;
                exportSuccessMessage = "Data exported in default Trading Account Format.";
            }
            
            const dataForSheet: any[] = [];
            const unmappedHeadersDuringCurrentExport: string[] = [];

            rows.forEach((rowItem, dataRowIdx) => {
                const dataRowObject: any = {}; 
                if(dataRowIdx === 0) console.log(`${logPreamble} Processing FIRST dataRow for data array`, rowItem);
                headersForDataMapping.forEach(customHeader => {
                    const normalizedCustomHeader = normalizeHeader(customHeader);
                    let foundValue: any = undefined; 
                    let mappedToKey: string | null = null;
                    for (const key in tradingAccountRowToPossibleHeadersMap) {
                        if (tradingAccountRowToPossibleHeadersMap[key as keyof TradingAccountRow].includes(normalizedCustomHeader)) {
                            foundValue = rowItem[key as keyof TradingAccountRow];
                            mappedToKey = key;
                            break;
                        }
                    }
                    if (dataRowIdx === 0) { // Log mapping only for the first data row for brevity
                        if (mappedToKey) {
                            console.log(`${logPreamble}   MAP: CustomHeader='${customHeader}' (Norm='${normalizedCustomHeader}') -> DataKey='${mappedToKey}', Val='${foundValue}'`);
                        } else {
                            console.warn(`${logPreamble}   NO MAP: CustomHeader='${customHeader}' (Norm='${normalizedCustomHeader}')`);
                            if (!unmappedHeadersDuringCurrentExport.includes(customHeader)) unmappedHeadersDuringCurrentExport.push(customHeader);
                        }
                    }
                    dataRowObject[customHeader] = foundValue === undefined || foundValue === null ? '' : foundValue;
                });
                dataForSheet.push(dataRowObject);
            });

            finalUnmappedHeadersForMessage = unmappedHeadersDuringCurrentExport;
            if (finalUnmappedHeadersForMessage.length > 0) {
                console.warn(`${logPreamble} Unmapped custom headers for this export:`, finalUnmappedHeadersForMessage);
            }
            console.log(`${logPreamble} Data array for sheet_add_json (first item if many):`, dataForSheet.length > 0 ? JSON.parse(JSON.stringify(dataForSheet[0])) : 'Empty data array');
            console.log(`${logPreamble} Total data rows for sheet_add_json: ${dataForSheet.length}`);

            if (dataForSheet.length > 0) {
                XLSX.utils.sheet_add_json(newWorksheet, dataForSheet, {
                    header: headersForDataMapping, 
                    skipHeader: true, // Headers are already written (or default ones styled)
                    origin: dataStartExcelRow - 1 // XLSX sheet_add_json origin is 0-indexed row number
                });
                console.log(`${logPreamble} Data added to worksheet using sheet_add_json, origin row index ${dataStartExcelRow - 1}.`);
            } else {
                console.log(`${logPreamble} No data rows to add via sheet_add_json.`);
            }
            
            // Apply cell-specific styling for data rows (currency, percentage, conditional colors)
            const currencyStyle = { numFmt: "$#,##0.00;[Red]-$#,##0.00" };
            const percentageStyle = { numFmt: "0.00%" };
            const dataStartRowIndex0Based = dataStartExcelRow - 1; // Convert 1-indexed Excel row to 0-indexed for loops

            headersForDataMapping.forEach((header, colIndex) => { // Iterate through mapping headers
                 rows.forEach((originalRowData, originalRowIndex) => { // Iterate through original data rows
                    const currentExcelRow0Based = dataStartRowIndex0Based + originalRowIndex;
                    const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: currentExcelRow0Based}); 
                    
                    // Ensure cell object exists (it should from sheet_add_json if dataForSheet was not empty)
                    if (!newWorksheet[cellAddress]) newWorksheet[cellAddress] = { v: undefined }; 
                    
                    let cellSpecificStyle = newWorksheet[cellAddress].s || {}; // Preserve existing style if any (e.g. from template)
                    let originalDataKey: keyof TradingAccountRow | null = null;
                    const normalizedCurrentHeader = normalizeHeader(header);

                    // Find which TradingAccountRow key this header maps to
                    for (const key in tradingAccountRowToPossibleHeadersMap) {
                        if (tradingAccountRowToPossibleHeadersMap[key as keyof TradingAccountRow].includes(normalizedCurrentHeader)) {
                            originalDataKey = key as keyof TradingAccountRow;
                            break;
                        }
                    }
                    
                    if (originalDataKey) {
                        const originalValueFromDataRow = originalRowData[originalDataKey];
                        
                        // Apply type and format for Excel
                        if (['inputCurrentUnitPrice', 'currentTotalPrice', 'supplierUnitPriceUSD', 'supplierTotalPriceUSD', 'gpUSD'].includes(originalDataKey)) {
                             if (typeof originalValueFromDataRow === 'number' && !isNaN(originalValueFromDataRow)) { 
                                newWorksheet[cellAddress].t = 'n'; 
                                newWorksheet[cellAddress].v = originalValueFromDataRow; // Ensure it's the number
                                cellSpecificStyle = { ...cellSpecificStyle, ...currencyStyle };
                             } else { // Fallback for unexpected non-numbers
                                newWorksheet[cellAddress].t = 's'; 
                                newWorksheet[cellAddress].v = String(originalValueFromDataRow ?? '');
                             }
                        } else if (originalDataKey === 'gpPercentage') {
                            if (typeof originalValueFromDataRow === 'string') {
                                const numericPercent = parseFloat(originalValueFromDataRow.replace('%','')) / 100;
                                if(!isNaN(numericPercent)) {
                                    newWorksheet[cellAddress].t = 'n'; newWorksheet[cellAddress].v = numericPercent; // Store as number (0.25 for 25%)
                                    cellSpecificStyle = { ...cellSpecificStyle, ...percentageStyle };
                                } else { newWorksheet[cellAddress].t = 's'; newWorksheet[cellAddress].v = originalValueFromDataRow; } // Keep as string if not parseable
                            } else { newWorksheet[cellAddress].t = 's'; newWorksheet[cellAddress].v = String(originalValueFromDataRow ?? ''); }
                        } else if (originalDataKey === 'inputQty') {
                             if (typeof originalValueFromDataRow === 'number' && !isNaN(originalValueFromDataRow)) {
                                newWorksheet[cellAddress].t = 'n'; newWorksheet[cellAddress].v = originalValueFromDataRow;
                             } else { newWorksheet[cellAddress].t = 's'; newWorksheet[cellAddress].v = String(originalValueFromDataRow ?? ''); }
                        }
                        // Conditional font color for GP USD and GP%
                        if (originalDataKey === 'gpUSD' && typeof originalRowData.gpUSD === 'number') {
                            if (originalRowData.gpUSD < 0) cellSpecificStyle.font = { ...(cellSpecificStyle.font || {}), color: { rgb: "FFFF0000" } }; // Red
                            else if (originalRowData.gpUSD > 0) cellSpecificStyle.font = { ...(cellSpecificStyle.font || {}), color: { rgb: "FF008000" } }; // Green
                        } else if (originalDataKey === 'gpPercentage') { 
                             const numericValueForColor = (newWorksheet[cellAddress].t === 'n' && typeof newWorksheet[cellAddress].v === 'number') 
                                                        ? newWorksheet[cellAddress].v // Already a number like 0.25
                                                        : parseFloat(String(originalValueFromDataRow).replace('%','')) / 100; 
                            if (typeof numericValueForColor === 'number' && !isNaN(numericValueForColor)) {
                                if (numericValueForColor < 0) cellSpecificStyle.font = { ...(cellSpecificStyle.font || {}), color: { rgb: "FFFF0000" } };
                                else if (numericValueForColor > 0) cellSpecificStyle.font = { ...(cellSpecificStyle.font || {}), color: { rgb: "FF008000" } };
                            }
                        }
                    }
                    // Apply the determined style (or existing style if unchanged)
                    if (Object.keys(cellSpecificStyle).length > 0) newWorksheet[cellAddress].s = cellSpecificStyle;
                });
            });
            
            // Set column widths: Use template's if active, otherwise auto-calculate for default/text-only custom
            if (!newWorksheet['!cols'] && (!customFormatTemplateSheet || (customTradingFormatHeaders && customTradingFormatHeaders.length > 0 && !customFormatTemplateSheet['!cols'])) ) {
                const colWidths = headersForDataMapping.map((h, colIdx) => {
                    const dataColValues = rows.map(rItem => {
                        const normH = normalizeHeader(h);
                        for (const key in tradingAccountRowToPossibleHeadersMap) {
                             if (tradingAccountRowToPossibleHeadersMap[key as keyof TradingAccountRow].includes(normH)) return String(rItem[key as keyof TradingAccountRow] ?? '');
                        }
                        return '';
                    });
                    let headerTextLength = String(h).length;
                    const maxLengthInData = dataColValues.length > 0 ? Math.max(...dataColValues.map(val => String(val).length)) : 0;
                    return { wch: Math.min(Math.max(headerTextLength, maxLengthInData, 10) + 2, 50) }; 
                });
                newWorksheet['!cols'] = colWidths;
                console.log(`${logPreamble} Auto-calculated column widths for default/text-only custom headers:`, colWidths);
            }
            
            // Finalize worksheet range
            const finalRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }; // Default start
            if (newWorksheet['!ref']) { // If sheet_add_json or header copy set a range, start from there
                const decodedRange = XLSX.utils.decode_range(newWorksheet['!ref']);
                finalRange.s = decodedRange.s; // Usually A1
                finalRange.e = decodedRange.e;
            }
            // Ensure range covers all data rows and header rows
            const dataEndRowIndex0Based = (dataStartExcelRow - 1) + rows.length -1;
            finalRange.e.r = Math.max(finalRange.e.r, dataEndRowIndex0Based < (dataStartExcelRow -1) ? templateHeaderRowCount -1 : dataEndRowIndex0Based); 
            finalRange.e.c = Math.max(finalRange.e.c, (headersForDataMapping?.length || 1) -1);
            newWorksheet['!ref'] = XLSX.utils.encode_range(finalRange);
            console.log(`${logPreamble} Final worksheet '!ref':`, newWorksheet['!ref']);
            
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Trading Account');
            console.log(`${logPreamble} Workbook structure before writeFile:`, { SheetNames: newWorkbook.SheetNames, TargetSheetRef: newWorkbook.Sheets['Trading Account'] ? newWorkbook.Sheets['Trading Account']['!ref'] : 'N/A' });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            XLSX.writeFile(newWorkbook, `TradingAccount_TA_Format_${timestamp}.xlsx`);
            
            exportSuccessMessage += ` Processed ${rows.length} data rows.`;
            if (finalUnmappedHeadersForMessage.length > 0) {
                exportSuccessMessage += ` \n\nIMPORTANT: The following headers from your custom template were NOT mapped to any known data fields: ${finalUnmappedHeadersForMessage.join(', ')}. These columns may appear empty in your export. Please check your template's header names (usually the 2nd row for 2-row headers) against the expected data fields or aliases.`;
            }
            setSuccessMessage(exportSuccessMessage);

        } catch (err) {
          console.error("Export error (Trading Format):", err);
          setError(err instanceof Error ? err.message : 'Failed to export data in Trading Account Format.');
        } finally {
          setIsExporting(false);
          setShowPreviewModal(false); 
        }
    }, [rows, customTradingFormatHeaders, customFormatTemplateSheet, savedFormatFileName]);

    const exportAsSimpleFormat = useCallback(() => { 
        setIsExporting(true); setError(null); setSuccessMessage(null);
        console.log("[Export Simple Format] Starting. Rows count:", rows.length);
        try {
          const aoaData = [
            ['Bonhoeffer Code', 'Qty', 'Current Unit Price', 'Product Name', 'Current Total'],
            ...rows.map(row => [ row.inputBonhoefferCode, row.inputQty, row.inputCurrentUnitPrice, row.productName, row.currentTotalPrice ])
          ];
          console.log("[Export Simple Format] aoaData for sheet:", JSON.parse(JSON.stringify(aoaData.slice(0,5)))); // Log first 5
          const worksheet = window.XLSX.utils.aoa_to_sheet(aoaData);
           worksheet['!cols'] = [ { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 20 } ];
          const workbook = window.XLSX.utils.book_new();
          window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Simple Trading Data');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          console.log("[Export Simple Format] Workbook structure before writeFile:", { SheetNames: workbook.SheetNames, TargetSheetRef: workbook.Sheets['Simple Trading Data'] ? workbook.Sheets['Simple Trading Data']['!ref'] : 'N/A' });
          window.XLSX.writeFile(workbook, `TradingAccount_SimpleFormat_${timestamp}.xlsx`);
          setSuccessMessage(`Data exported in Simple Format. Processed ${rows.length} data rows.`);
        } catch (err) { console.error("Export error (Simple Format):", err); setError(err instanceof Error ? err.message : 'Failed to export data in Simple Format.');
        } finally { setIsExporting(false); setShowPreviewModal(false); }
    }, [rows]);
    
    const handleBasicFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { 
        const file = event.target.files?.[0];
        if (!file) return;
        setBasicFileProcessingLoading(true); setError(null); setSuccessMessage(null);
        console.log("[Basic Upload] Processing file:", file.name);
        try {
            const reader = new FileReader();
            const fileData = await new Promise<string | ArrayBuffer | null>((resolve, reject) => {
                reader.onload = (e) => resolve(e.target?.result);
                reader.onerror = (errorEvent) => reject(new Error("Failed to read file: " + String(errorEvent)));
                if (file.name.endsWith('.csv')) reader.readAsText(file); else reader.readAsBinaryString(file);
            });
            if (!fileData) throw new Error("Empty file data.");
            let parsedExcelRows: any[] = [];
            if (file.name.endsWith('.csv')) {
                const result = window.Papa.parse(fileData as string, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim() });
                if (result.errors.length > 0) throw new Error(`Error parsing CSV: ${result.errors[0].message}`);
                parsedExcelRows = result.data;
            } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                const workbook = window.XLSX.read(fileData, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                parsedExcelRows = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            } else { throw new Error("Unsupported file type."); }
            if (parsedExcelRows.length === 0) { setSuccessMessage("No data rows in file."); setBasicFileProcessingLoading(false); if (basicFileInputRef.current) basicFileInputRef.current.value = ""; return; }
            
            const excelHeaders = Object.keys(parsedExcelRows[0] || {});
            console.log("[Basic Upload] Headers read from file:", excelHeaders);
            const mappedHeaders: { [originalHeader: string]: keyof Pick<TradingAccountRow, 'inputBonhoefferCode' | 'inputQty' | 'inputCurrentUnitPrice'> } = {};
            let foundCode = false, foundQty = false, foundPrice = false;
            excelHeaders.forEach(header => {
                const normalizedH = normalizeHeader(header);
                const logPreamble = `[Basic Upload] Header Scan: FileH='${header}' (Normalized='${normalizedH}')`;
                if (tradingInputHeaderMap[normalizedH]) {
                    mappedHeaders[header] = tradingInputHeaderMap[normalizedH];
                    console.log(`${logPreamble} -> MAPPED to: '${tradingInputHeaderMap[normalizedH]}'`);
                    if (tradingInputHeaderMap[normalizedH] === 'inputBonhoefferCode') foundCode = true;
                    if (tradingInputHeaderMap[normalizedH] === 'inputQty') foundQty = true;
                    if (tradingInputHeaderMap[normalizedH] === 'inputCurrentUnitPrice') foundPrice = true;
                } else { console.log(`${logPreamble} -> NO MAP found in tradingInputHeaderMap.`); }
            });
            console.log("[Basic Upload] Header Mapping Result: Code Found?", foundCode, "Qty Found?", foundQty, "Price Found?", foundPrice);
            console.log("[Basic Upload] Full mappedHeaders object:", mappedHeaders);
            if (!foundCode || !foundQty || !foundPrice) {
                let missing = [];
                if (!foundCode) missing.push("'Bonhoeffer Code'"); if (!foundQty) missing.push("'Qty'"); if (!foundPrice) missing.push("'Current Unit Price'");
                throw new Error(`Basic file upload error: Required columns (${missing.join(', ')}) not found or not mapped correctly in the Excel file. Please check headers. Expected aliases are e.g., 'bcode', 'quantity', 'saleprice'.`);
            }
            const newRowsFromExcel: TradingAccountRow[] = []; let skippedCount = 0;
            parsedExcelRows.forEach((row, index) => {
                const bCodeKey = Object.keys(mappedHeaders).find(h => mappedHeaders[h] === 'inputBonhoefferCode')!;
                const qtyKey = Object.keys(mappedHeaders).find(h => mappedHeaders[h] === 'inputQty')!;
                const priceKey = Object.keys(mappedHeaders).find(h => mappedHeaders[h] === 'inputCurrentUnitPrice')!;
                const bCode = String(row[bCodeKey] || '').trim();
                const qtyVal = parseFloat(String(row[qtyKey] || '0').replace(/,/g, ''));
                const priceVal = parseFloat(String(row[priceKey] || '0').replace(/,/g, ''));
                if (!bCode || isNaN(qtyVal) || qtyVal <= 0 || isNaN(priceVal) || priceVal < 0) { console.warn(`Skipping row ${index + 1} (Basic Excel) invalid data: Code='${bCode}', Qty=${qtyVal}, Price=${priceVal}`); skippedCount++; return; }
                newRowsFromExcel.push(processAndAddRow(bCode, qtyVal, priceVal));
            });
            if (newRowsFromExcel.length > 0) { setRows(prevRows => [...newRowsFromExcel.reverse(), ...prevRows]); let message = `${newRowsFromExcel.length} entries added from "${file.name}".`; if (skippedCount > 0) message += ` ${skippedCount} rows skipped (invalid data).`; setSuccessMessage(message);
            } else { setSuccessMessage(`No valid entries from "${file.name}". ${skippedCount > 0 ? skippedCount + ' rows skipped.' : ''}`); }
        } catch (err) { console.error("Basic file upload error:", err); setError(err instanceof Error ? err.message : 'Failed to process file.');
        } finally { setBasicFileProcessingLoading(false); if (basicFileInputRef.current) basicFileInputRef.current.value = ""; }
    };
    
    const handleFullFormatFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { 
        const file = event.target.files?.[0]; if (!file) return;
        setFullFormatFileProcessingLoading(true); setError(null); setSuccessMessage(null);
        console.log("[Full Format Upload] Processing file:", file.name);
        try {
            const reader = new FileReader();
            const fileData = await new Promise<string | ArrayBuffer | null>((resolve, reject) => { reader.onload = (e) => resolve(e.target?.result); reader.onerror = (evt) => reject(new Error("Failed to read file: " + String(evt))); if (file.name.endsWith('.csv')) reader.readAsText(file); else reader.readAsBinaryString(file); });
            if (!fileData) throw new Error("Empty file data.");
            let parsedExcelRows: any[] = [];
            if (file.name.endsWith('.csv')) { const result = window.Papa.parse(fileData as string, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim() }); if (result.errors.length > 0) throw new Error(`CSV Parse Error: ${result.errors[0].message}`); parsedExcelRows = result.data;
            } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) { const workbook = window.XLSX.read(fileData, { type: 'binary' }); const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName]; parsedExcelRows = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            } else { throw new Error("Unsupported file type."); }
            if (parsedExcelRows.length === 0) { setSuccessMessage("No data rows in file."); setFullFormatFileProcessingLoading(false); if (fullFormatFileInputRef.current) fullFormatFileInputRef.current.value = ""; return; }
            const excelHeaders = Object.keys(parsedExcelRows[0] || {}); console.log("[Full Format Upload] Headers from file:", excelHeaders);
            const mappedHeaderKeys: { [originalHeader: string]: keyof TradingAccountRow | 'currentTotalAlias' | 'supplierTotalAlias' | 'gpUsdAlias' | 'gpPercentageAlias' } = {};
            let foundCode = false, foundQty = false, foundPrice = false;
            excelHeaders.forEach(header => { const normalizedH = normalizeHeader(header); const log = `[Full Format Upload] Header: '${header}', Norm: '${normalizedH}'`; if (fullTradingFormatHeaderMap[normalizedH]) { mappedHeaderKeys[header] = fullTradingFormatHeaderMap[normalizedH]; console.log(log + ` -> Mapped: '${fullTradingFormatHeaderMap[normalizedH]}'`); if (fullTradingFormatHeaderMap[normalizedH] === 'inputBonhoefferCode') foundCode = true; if (fullTradingFormatHeaderMap[normalizedH] === 'inputQty') foundQty = true; if (fullTradingFormatHeaderMap[normalizedH] === 'inputCurrentUnitPrice') foundPrice = true; } else { console.log(log + " -> NO MAP in fullTradingFormatHeaderMap."); } });
            console.log("[Full Format Upload] Map Result: Code?", foundCode, "Qty?", foundQty, "Price?", foundPrice);
            if (!foundCode || !foundQty || !foundPrice) { let missing = []; if (!foundCode) missing.push("'B.Code'"); if (!foundQty) missing.push("'Qty'"); if (!foundPrice) missing.push("'Current Unit Price'"); throw new Error(`Required columns (${missing.join(', ')}) for basic data not found/mapped in full format Excel.`); }
            const newRowsFromExcel: TradingAccountRow[] = []; let skippedCount = 0;
            parsedExcelRows.forEach((row, index) => {
                const getVal = (targetKey: keyof TradingAccountRow | 'currentTotalAlias' | 'supplierTotalAlias' | 'gpUsdAlias' | 'gpPercentageAlias'): any => { const originalHeader = Object.keys(mappedHeaderKeys).find(h => mappedHeaderKeys[h] === targetKey); return originalHeader ? row[originalHeader] : undefined; };
                const bCode = String(getVal('inputBonhoefferCode') || '').trim();
                const qtyVal = parseFloat(String(getVal('inputQty') || '0').replace(/,/g, ''));
                const currentPriceVal = parseFloat(String(getVal('inputCurrentUnitPrice') || '0').replace(/,/g, ''));
                if (!bCode || isNaN(qtyVal) || qtyVal <= 0 || isNaN(currentPriceVal) || currentPriceVal < 0) { console.warn(`Skipping row ${index + 1} (Full Format Excel) invalid essential data: Code='${bCode}', Qty=${qtyVal}, Price=${currentPriceVal}`); skippedCount++; return; }
                const productName = String(getVal('productName') || '').trim() || undefined; 
                const supplierName = String(getVal('supplierName') || '').trim() || undefined;
                let supplierUnitPriceUSD_val: number | undefined; const supPriceValStr = String(getVal('supplierUnitPriceUSD') || '').replace(/,/g, ''); if (supPriceValStr.trim() !== '') { const supPriceNum = parseFloat(supPriceValStr); if (!isNaN(supPriceNum)) supplierUnitPriceUSD_val = supPriceNum; }
                let providedCurrentTotal: number | undefined; const currentTotalStr = String(getVal('currentTotalAlias') || '').replace(/,/g, ''); if (currentTotalStr.trim() !== '') { const num = parseFloat(currentTotalStr); if (!isNaN(num)) providedCurrentTotal = num; }
                let providedSupplierTotal: number | undefined; const supplierTotalStr = String(getVal('supplierTotalAlias') || '').replace(/,/g, ''); if (supplierTotalStr.trim() !== '') { const num = parseFloat(supplierTotalStr); if (!isNaN(num)) providedSupplierTotal = num; }
                let providedGpUSD_val: number | undefined; const gpUsdStr = String(getVal('gpUsdAlias') || '').replace(/,/g, ''); if (gpUsdStr.trim() !== '') { const num = parseFloat(gpUsdStr); if (!isNaN(num)) providedGpUSD_val = num; }
                let providedGpPercentage_val: string | undefined; const gpPercentageStr = String(getVal('gpPercentageAlias') || '').trim(); if (gpPercentageStr !== '') { providedGpPercentage_val = gpPercentageStr.includes('%') ? gpPercentageStr : `${gpPercentageStr}%`; }
                newRowsFromExcel.push(processAndAddRow(bCode, qtyVal, currentPriceVal, productName, supplierName, supplierUnitPriceUSD_val, providedCurrentTotal, providedSupplierTotal, providedGpUSD_val, providedGpPercentage_val));
            });
            if (newRowsFromExcel.length > 0) { setRows(prevRows => [...newRowsFromExcel.reverse(), ...prevRows]); let msg = `${newRowsFromExcel.length} entries added from "${file.name}" (Full Format).`; if (skippedCount > 0) msg += ` ${skippedCount} rows skipped.`; setSuccessMessage(msg);
            } else { setSuccessMessage(`No valid entries from "${file.name}". ${skippedCount > 0 ? skippedCount + ' rows skipped.' : ''}`); }
        } catch (err) { console.error("Full format file upload error:", err); setError(err instanceof Error ? err.message : 'Failed to process full format file.');
        } finally { setFullFormatFileProcessingLoading(false); if (fullFormatFileInputRef.current) fullFormatFileInputRef.current.value = ""; }
    };
    
    const handleFormatTemplateUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => { 
        const file = event.target.files?.[0]; if (!file) return;
        setFormatFileProcessingLoading(true); setError(null); setSuccessMessage(null); setCustomFormatTemplateSheet(null); setCustomTradingFormatHeaders(null); 
        console.log("[Format Template Upload] Processing file:", file.name);
        try {
            const reader = new FileReader();
            const fileData = await new Promise<string | ArrayBuffer | null>((resolve, reject) => { reader.onload = (e) => resolve(e.target?.result); reader.onerror = (evt) => reject(new Error("Read fail: " + String(evt))); reader.readAsArrayBuffer(file); });
            if (!fileData) throw new Error("Empty file data for template.");
            const workbook = window.XLSX.read(fileData, { type: 'array', cellStyles: true }); 
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) throw new Error("No sheets in template.");
            const firstSheetName = workbook.SheetNames[0]; const templateSheet = workbook.Sheets[firstSheetName];
            console.log("[Format Template Upload] Raw template sheet for session (properties like !merges, !cols should be here if in file):", templateSheet); 
            setCustomFormatTemplateSheet(templateSheet); 
            
            const sheetDataForHeaders: any[][] = window.XLSX.utils.sheet_to_json(templateSheet, { header: 1, defval: null });
            console.log("[Format Template Upload] Data extracted from template (for headers - first 2 rows):", JSON.parse(JSON.stringify(sheetDataForHeaders.slice(0,2))));
            
            if (!sheetDataForHeaders || sheetDataForHeaders.length === 0 || !sheetDataForHeaders[0] || sheetDataForHeaders[0].length === 0) throw new Error("Template sheet empty or no header row found.");
            
            let headersToSet: string[]; let headerSourceMessage: string;
            // Check if second row has substantial content to be considered a header row for mapping
            if (sheetDataForHeaders.length >= 2 && sheetDataForHeaders[1] && sheetDataForHeaders[1].some(cell => String(cell ?? '').trim() !== '')) {
                headersToSet = sheetDataForHeaders[1].map(headerCell => String(headerCell ?? "").trim()).filter(h => h); // Use 2nd row for mapping
                headerSourceMessage = `Headers for data mapping taken from template's 2nd row. Both header rows & styling will be used for export (current session).`;
                console.log("[Format Template Upload] Using 2nd row for mapping headers:", headersToSet);
            } else { // Otherwise, use 1st row for mapping
                headersToSet = sheetDataForHeaders[0].map(headerCell => String(headerCell ?? "").trim()).filter(h => h);
                headerSourceMessage = `Headers for data mapping taken from template's 1st row. Header row & styling will be used for export (current session).`;
                console.log("[Format Template Upload] Using 1st row for mapping headers:", headersToSet);
            }

            if (headersToSet.length === 0) throw new Error("Format template upload error: No valid headers found in the mapping row (1st or 2nd) of the template file. Please ensure headers are present and non-empty.");
            
            setCustomTradingFormatHeaders(headersToSet); setSavedFormatFileName(file.name); 
            setSuccessMessage(`Custom format "${file.name}" set. ${headerSourceMessage} Detected headers for mapping: ${headersToSet.slice(0, 5).join(', ')}${headersToSet.length > 5 ? '...' : ''} (${headersToSet.length} total).`);
        } catch (err) { 
            console.error("Format template upload error:", err); 
            setError(err instanceof Error ? err.message : 'Failed to process template.'); 
            setCustomTradingFormatHeaders(null); setSavedFormatFileName(null); setCustomFormatTemplateSheet(null);
        } finally { 
            setFormatFileProcessingLoading(false); 
            if (formatTemplateFileInputRef.current) formatTemplateFileInputRef.current.value = ""; 
        }
    }, []);
    
    const handleClearSetFormat = () => { 
        setCustomTradingFormatHeaders(null); setSavedFormatFileName(null); setCustomFormatTemplateSheet(null); 
        setSuccessMessage("Custom format template cleared. Exports will use default format and styling.");
    };

    // Function to extract style from a cell for preview
    const getCellStyleForPreview = (sheet: any, R: number, C: number): PreviewCellStyle => {
        const cellAddress = window.XLSX.utils.encode_cell({ r: R, c: C });
        const cell = sheet ? sheet[cellAddress] : null;
        const style: PreviewCellStyle = {};
        if (cell && cell.s) { // cell.s contains the style object
            if (cell.s.font) {
                if (cell.s.font.bold) style.fontWeight = 'bold';
                if (cell.s.font.color && cell.s.font.color.rgb) {
                    // XLSX stores ARGB, typically FFRRGGBB or RRGGBB. CSS needs #RRGGBB.
                    const rgb = cell.s.font.color.rgb;
                    style.color = `#${rgb.length > 6 ? rgb.slice(-6) : rgb}`;
                }
            }
            if (cell.s.fill && cell.s.fill.fgColor && cell.s.fill.fgColor.rgb) {
                const rgb = cell.s.fill.fgColor.rgb;
                style.backgroundColor = `#${rgb.length > 6 ? rgb.slice(-6) : rgb}`;
            }
        }
        return style;
    };
    
    const preparePreviewForTradingAccountFormat = useCallback(() => {
        if (rows.length === 0) { setError("No data for preview."); return; }
        console.log("[Prepare TA Preview] Start. Custom Sheet Active?", !!customFormatTemplateSheet, "Custom Headers (text)?", customTradingFormatHeaders);

        const defaultTAHeaders = ['Product', 'Bonhoeffer Code', 'Qty', 'Current Unit Price', 'Current Total', 'Supplier', 'Price in USD Unit Price', 'Supplier Total', 'GC', 'GP%'];
        let headersForPreviewMapping: string[] = defaultTAHeaders; // Headers used for data mapping in the preview table
        let firstHeaderRowContentForPreview: string[] | null = null; // Content of the first header row, if 2-row template
        let note = "Previewing data with default Trading Account Format headers. Download will use this format and default styling.";
        let extractedHeaderStyles: Array<Array<PreviewCellStyle | null>> = [];
        let extractedMergedCells: PreviewMergedCellInfo[] = [];
        let extractedColWidths: { wch: number }[] | null = null;
        let headerRowCountForPreview = 1;

        if (customFormatTemplateSheet && customTradingFormatHeaders && customTradingFormatHeaders.length > 0) {
            console.log("[Prepare TA Preview] Using custom template sheet details for preview.");
            headersForPreviewMapping = customTradingFormatHeaders; // These are from template's 1st or 2nd row, used for data mapping
            const sheetData: any[][] = window.XLSX.utils.sheet_to_json(customFormatTemplateSheet, { header: 1, defval: null });
            
            if (sheetData.length >= 2 && sheetData[1] && sheetData[1].some(cell => String(cell ?? '').trim() !== '')) {
                headerRowCountForPreview = 2;
                firstHeaderRowContentForPreview = sheetData[0].map(cell => String(cell ?? '').trim());
                // Headers for mapping are already set to customTradingFormatHeaders (which should be from 2nd row)
                note = `Previewing with your custom <strong>2-row header template</strong> (styling active for this session).<br/>Data mapping uses the <strong>2nd header row</strong>. Download will include full template structure & styling.`;
                console.log("[Prepare TA Preview] 2-row header template active. Row 1 for display:", firstHeaderRowContentForPreview, "Row 2 (mapping):", headersForPreviewMapping);
            } else if (sheetData.length >= 1) {
                headerRowCountForPreview = 1;
                // Headers for mapping (customTradingFormatHeaders) are from 1st row
                note = `Previewing with your custom <strong>1-row header template</strong> (styling active for this session).<br/>Download will include template structure & styling.`;
                 console.log("[Prepare TA Preview] 1-row header template active. Mapping headers:", headersForPreviewMapping);
            }
            
            // Extract styles, merges, and colWidths for the header rows to be shown in preview
            for (let R = 0; R < headerRowCountForPreview; R++) {
                const rowStyles: Array<PreviewCellStyle | null> = [];
                const sourceRow = (R === 0 && headerRowCountForPreview === 2 && firstHeaderRowContentForPreview) ? firstHeaderRowContentForPreview : headersForPreviewMapping;
                for (let C = 0; C < sourceRow.length ; C++) { // Iterate based on actual header length
                     rowStyles.push(getCellStyleForPreview(customFormatTemplateSheet, R, C));
                }
                extractedHeaderStyles.push(rowStyles);
            }
            if (customFormatTemplateSheet['!merges']) {
                extractedMergedCells = customFormatTemplateSheet['!merges']
                    .filter((merge: PreviewMergedCellInfo) => merge.s.r < headerRowCountForPreview); // Only take merges within header rows
            }
            if (customFormatTemplateSheet['!cols']) {
                extractedColWidths = customFormatTemplateSheet['!cols'].map((col: any) => ({ wch: col.wch || col.wpx / 7 })); // approx wch if wpx
            }
             console.log("[Prepare TA Preview] Extracted Styles:", extractedHeaderStyles, "Merges:", extractedMergedCells, "ColWidths:", extractedColWidths);

        } else if (customTradingFormatHeaders && customTradingFormatHeaders.length > 0) {
            headersForPreviewMapping = customTradingFormatHeaders; // Use text-only custom headers
            note = "Previewing data with saved custom headers (styling and detailed structure like 2-row headers from template are NOT active for this session).<br/>Re-upload template to activate full styling and structure.";
            headerRowCountForPreview = 1; // Only one row of text headers
            console.log("[Prepare TA Preview] Using TEXT custom headers, default styling. Mapping headers:", headersForPreviewMapping);
        }
        
        // Generate sample data rows for preview, mapped to headersForPreviewMapping
        const dataForPreviewTable = rows.slice(0, 50).map(tradingRow => 
            headersForPreviewMapping.map(header => {
                const normalizedHeader = normalizeHeader(header);
                for (const key in tradingAccountRowToPossibleHeadersMap) {
                    if (tradingAccountRowToPossibleHeadersMap[key as keyof TradingAccountRow].includes(normalizedHeader)) {
                        let val = tradingRow[key as keyof TradingAccountRow];
                        // Basic formatting for preview consistency with table
                        if (['inputCurrentUnitPrice', 'currentTotalPrice', 'supplierUnitPriceUSD', 'supplierTotalPriceUSD', 'gpUSD'].includes(key) && typeof val === 'number') {
                            return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                        }
                        if (key === 'inputQty' && typeof val === 'number') return val.toLocaleString();
                        return val ?? '';
                    }
                }
                return ''; // If header not mapped
            })
        );

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        setPreviewActualHeaderRow1Content(firstHeaderRowContentForPreview);
        setPreviewHeaders(headersForPreviewMapping); 
        setPreviewRowsData(dataForPreviewTable);
        setPreviewFormatType('TradingAccountFormat');
        setPreviewFileName(`TradingAccount_TA_Format_${timestamp}.xlsx`);
        setPreviewModalNote(note);
        setPreviewHeaderRowStyles(extractedHeaderStyles);
        setPreviewMergedCellsInfo(extractedMergedCells);
        setPreviewColWidthsInfo(extractedColWidths);
        
        setShowExportChoiceModal(false); 
        setShowPreviewModal(true);      
        console.log("[Prepare TA Preview] Preview ready. Note:", note);
    }, [rows, customTradingFormatHeaders, customFormatTemplateSheet]);

    const preparePreviewForSimpleFormat = useCallback(() => { 
        if (rows.length === 0) { setError("No data for preview."); return; }
        const headers = ['Bonhoeffer Code', 'Qty', 'Current Unit Price', 'Product Name', 'Current Total'];
        const sampleData = rows.slice(0, 50).map(r => [
            r.inputBonhoefferCode, 
            r.inputQty.toLocaleString(), 
            r.inputCurrentUnitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 
            r.productName, 
            r.currentTotalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        ]);
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        
        setPreviewActualHeaderRow1Content(null); // No 2-row header for simple format
        setPreviewHeaders(headers); 
        setPreviewRowsData(sampleData); 
        setPreviewFormatType('SimpleFormat');
        setPreviewFileName(`TradingAccount_SimpleFormat_${ts}.xlsx`); 
        setPreviewModalNote('Previewing data in a simple 5-column format. Actual export will use this structure.'); 
        setPreviewHeaderRowStyles([]);
        setPreviewMergedCellsInfo([]);
        setPreviewColWidthsInfo(null);

        setShowExportChoiceModal(false); 
        setShowPreviewModal(true);      
    }, [rows]);

    const formatSectionJsx = (
        <section aria-labelledby="format-template-title" className="p-6 bg-white rounded-xl shadow-2xl">
             <h2 id="format-template-title" className="text-xl font-semibold text-slate-800 mb-6 border-b pb-4 flex items-center">
                <CogIcon className="w-6 h-6 mr-2 text-sky-600" />
                Manage Custom Export Format
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                <div>
                    <h3 className="text-md font-semibold text-slate-700 mb-2">Set Custom Trading Format Template</h3>
                    <label htmlFor="format-template-excel-upload" className={`inline-flex items-center px-5 py-3 bg-purple-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-105 ${formatFileProcessingLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <UploadIcon className="w-5 h-5 mr-2" />
                        {formatFileProcessingLoading ? 'Processing Template...' : 'Upload Format Template (Excel)'}
                    </label>
                    <input id="format-template-excel-upload" type="file" ref={formatTemplateFileInputRef} className="hidden" 
                           onChange={handleFormatTemplateUpload} accept=".xls,.xlsx" disabled={formatFileProcessingLoading} aria-describedby="format-template-desc" />
                    <p id="format-template-desc" className="mt-1.5 text-xs text-slate-600">
                        Upload an Excel file (1 or 2 header rows) to define your preferred "Trading Account Format" for exports. Styling (colors, fonts, merges, column widths) from template headers will be applied for the current session. Mapping headers are taken from the 2nd row if a 2-row header is detected.
                    </p>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-slate-700 mb-2">Current Custom Format</h3>
                    {savedFormatFileName ? (
                        <>
                            <p className="text-sm text-slate-600">Template File: <span className="font-semibold text-slate-800">{savedFormatFileName}</span></p>
                            <p className="text-xs text-slate-500">
                                Headers for mapping ({customTradingFormatHeaders?.length || 0} total): 
                                <span className="italic"> {customTradingFormatHeaders?.slice(0,4).join(', ') || "None set"}
                                {customTradingFormatHeaders && customTradingFormatHeaders.length > 4 ? '...' : ''}</span>
                            </p>
                             <p className="text-xs text-slate-500 mt-0.5">
                                {customFormatTemplateSheet ? 
                                    <span className="text-green-600 font-medium">Template styling & structure (incl. 2-row headers, merges, col widths) is ACTIVE for this session.</span> : 
                                    <span className="text-amber-600 font-medium">Template styling INACTIVE (re-upload template to activate). Text headers will be used with default styling.</span>
                                }
                            </p>
                            <button onClick={handleClearSetFormat} disabled={formatFileProcessingLoading}
                                    className="mt-2.5 text-xs text-red-600 hover:text-red-800 font-medium underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-1 py-0.5">
                                Clear Set Template
                            </button>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No custom format template set. Exports will use default format and styling.</p>
                    )}
                </div>
            </div>
        </section>
    );

    const entryFormSectionJsx = (
        <section aria-labelledby="manual-entry-title" className="p-6 bg-white rounded-xl shadow-2xl">
            <h2 id="manual-entry-title" className="text-xl font-semibold text-slate-800 mb-6 border-b pb-4 flex items-center">
                <CalculatorIcon className="w-6 h-6 mr-2 text-sky-600" />
                Manual Trading Account Entry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="bonhoefferCode" className="block text-sm font-medium text-slate-700 mb-1">Bonhoeffer Code</label>
                    <input type="text" id="bonhoefferCode" ref={bonhoefferCodeInputRef} value={bonhoefferCodeInput} onChange={(e) => setBonhoefferCodeInput(e.target.value)}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm" placeholder="Enter code" />
                </div>
                <div>
                    <label htmlFor="qty" className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <input type="number" id="qty" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm" placeholder="e.g., 100" />
                </div>
                <div>
                    <label htmlFor="currentUnitPrice" className="block text-sm font-medium text-slate-700 mb-1">Current Unit Price</label>
                    <input type="number" id="currentUnitPrice" value={currentUnitPriceInput} onChange={(e) => setCurrentUnitPriceInput(e.target.value)}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm" placeholder="e.g., 12.50" step="0.01" />
                </div>
                <button onClick={handleAddManualEntry} disabled={isLoading}
                        className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors transform hover:scale-105">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Entry'}
                </button>
            </div>
        </section>
    );

    const fileUploadSectionJsx = (
        <section aria-labelledby="excel-upload-title" className="p-6 bg-white rounded-xl shadow-2xl">
            <h2 id="excel-upload-title" className="text-xl font-semibold text-slate-800 mb-6 border-b pb-4 flex items-center">
                <UploadIcon className="w-6 h-6 mr-2 text-sky-600" />
                Upload from Excel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div>
                    <h3 className="text-md font-semibold text-slate-700 mb-2">Upload Basic Excel (3 Columns)</h3>
                     <label htmlFor="basic-excel-upload" className={`inline-flex items-center px-5 py-3 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-105 ${basicFileProcessingLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <UploadIcon className="w-5 h-5 mr-2" />
                        {basicFileProcessingLoading ? 'Processing Basic...' : 'Upload Basic Excel'}
                    </label>
                    <input id="basic-excel-upload" type="file" ref={basicFileInputRef} className="hidden" 
                           onChange={handleBasicFileUpload} accept=".xls,.xlsx" disabled={basicFileProcessingLoading} aria-describedby="basic-excel-desc"/>
                    <p id="basic-excel-desc" className="mt-1.5 text-xs text-slate-600">
                        File should contain: 'Bonhoeffer Code', 'Qty', 'Current Unit Price'. System will lookup Product & Supplier details.
                    </p>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-slate-700 mb-2">Upload Full Trading Format Excel</h3>
                     <label htmlFor="full-format-excel-upload" className={`inline-flex items-center px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-105 ${fullFormatFileProcessingLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        {fullFormatFileProcessingLoading ? 'Processing Full...' : 'Upload Full Format Excel'}
                    </label>
                    <input id="full-format-excel-upload" type="file" ref={fullFormatFileInputRef} className="hidden" 
                           onChange={handleFullFormatFileUpload} accept=".xls,.xlsx" disabled={fullFormatFileProcessingLoading} aria-describedby="full-format-desc"/>
                     <p id="full-format-desc" className="mt-1.5 text-xs text-slate-600">
                        File should match the Trading Account export format. Provided Product/Supplier data is prioritized.
                    </p>
                </div>
            </div>
        </section>
    );

    const tableSectionJsx = (
        <section aria-labelledby="trading-account-table-title" className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                <h2 id="trading-account-table-title" className="text-xl font-semibold text-slate-800">Trading Account Entries ({rows.length})</h2>
                <button onClick={openExportChoiceModal} disabled={rows.length === 0 || isExporting}
                        className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors transform hover:scale-105">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export All to Excel'}
                </button>
            </div>
             {rows.length === 0 ? (
                 <p className="p-10 text-center text-slate-600">No trading account entries yet. Add entries manually or upload an Excel file.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-800">
                    <thead className="text-xs text-slate-800 uppercase bg-slate-200/70 sticky top-0 z-10">
                        <tr>
                            {['Product', 'B. Code', 'Qty', 'Sell Price', 'Total Sell', 'Supplier', 'Purchase Price', 'Total Purchase', 'GP (USD)', 'GP %', 'Actions'].map(header => (
                                <th key={header} scope="col" className="px-4 py-3.5 whitespace-nowrap font-semibold first:pl-6 last:pr-6">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, index) => (
                            <tr key={row.id} className={`hover:bg-sky-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                <td className="px-4 py-2.5 whitespace-nowrap first:pl-6 font-medium text-slate-900">{row.productName}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap first:pl-6">{row.inputBonhoefferCode}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-right">{row.inputQty.toLocaleString()}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-right">{row.inputCurrentUnitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-right font-semibold">{row.currentTotalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap">{row.supplierName}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-right">{row.supplierUnitPriceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-right font-semibold">{row.supplierTotalPriceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td className={`px-4 py-2.5 whitespace-nowrap text-right font-bold ${row.gpUSD >= 0 ? 'text-green-600' : 'text-red-600'}`}>{row.gpUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td className={`px-4 py-2.5 whitespace-nowrap text-right font-bold ${parseFloat(row.gpPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{row.gpPercentage}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-center last:pr-6">
                                    <button onClick={() => handleRemoveRow(row.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-all" aria-label="Remove entry">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </section>
    );

    const ExportChoiceModalJsx = (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-[200] p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">Choose Export Format</h3>
                    <button onClick={() => setShowExportChoiceModal(false)} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Close modal"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <p className="text-sm text-slate-600 mb-6">Select the format for your Excel export:</p>
                <div className="space-y-3">
                    <button onClick={preparePreviewForTradingAccountFormat} className="w-full inline-flex items-center justify-center px-5 py-3 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-sky-700">Export in Trading Account Format</button>
                    <button onClick={preparePreviewForSimpleFormat} className="w-full inline-flex items-center justify-center px-5 py-3 bg-slate-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-slate-600">Export in Simple Format</button>
                </div>
            </div>
        </div>
    );

    const PreviewModalJsx = () => {
        const headerRowCountInPreview = previewActualHeaderRow1Content && previewActualHeaderRow1Content.length > 0 ? 2 : 1;
        const mappingHeadersForPreview = previewHeaders; // These are already set to template's 2nd or 1st row headers
        const firstHeaderRowValues = previewActualHeaderRow1Content || [];
    
        const maxColsInPreview = Math.max(
            firstHeaderRowValues.length,
            mappingHeadersForPreview.length,
            ...(previewColWidthsInfo ? [previewColWidthsInfo.length] : [])
        );

        // Create a lookup for merged cells to help skip rendering "slave" cells
        const mergedCellsLookup: Record<string, { type: 'master'; s: PreviewMergedCellInfo } | 'slave'> = {};
        if (previewMergedCellsInfo) {
            previewMergedCellsInfo.forEach(merge => {
                mergedCellsLookup[`${merge.s.r},${merge.s.c}`] = { type: 'master', s: merge };
                for (let r = merge.s.r; r <= merge.e.r; r++) {
                    for (let c = merge.s.c; c <= merge.e.c; c++) {
                        if (r !== merge.s.r || c !== merge.s.c) {
                            mergedCellsLookup[`${r},${c}`] = 'slave';
                        }
                    }
                }
            });
        }
    
        return (
            <div className="fixed inset-0 bg-slate-800 bg-opacity-80 flex items-center justify-center z-[210] p-4" aria-modal="true" role="dialog">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                        <h3 className="text-xl font-semibold text-slate-800">Export Preview: {previewFormatType === 'TradingAccountFormat' ? 'Trading Account Format' : 'Simple Format'}</h3>
                        <button onClick={() => setShowPreviewModal(false)} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Close preview"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                    {previewModalNote && (
                         <div className="mb-3 p-3 text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-md shadow-sm" dangerouslySetInnerHTML={{ __html: previewModalNote.replace(/\n/g, '<br />') }}></div>
                    )}
                    <div className="overflow-x-auto flex-grow mb-4 border border-slate-200 rounded-md shadow-inner bg-slate-25">
                        <table className="min-w-full text-xs text-left text-slate-700 border-collapse">
                            <thead className="text-xs text-slate-700 uppercase sticky top-0 z-10">
                                {[...Array(headerRowCountInPreview)].map((_, R) => (
                                    <tr key={`preview-h-row-${R}`} className="bg-slate-100">
                                        {[...Array(maxColsInPreview)].map((_, C) => {
                                            if (mergedCellsLookup[`${R},${C}`] === 'slave') return null; // Skip slave cells
    
                                            const cellContent = (R === 0 && headerRowCountInPreview === 2) ?
                                                               (firstHeaderRowValues[C] || '') :
                                                               (mappingHeadersForPreview[C] || '');
                                            
                                            let cellStyle: React.CSSProperties = {};
                                            if (previewHeaderRowStyles[R] && previewHeaderRowStyles[R][C]) {
                                                const styleInfo = previewHeaderRowStyles[R][C]!;
                                                if(styleInfo.fontWeight) cellStyle.fontWeight = styleInfo.fontWeight;
                                                if(styleInfo.color) cellStyle.color = styleInfo.color;
                                                if(styleInfo.backgroundColor) cellStyle.backgroundColor = styleInfo.backgroundColor;
                                            } else { // Default header styling if not from template
                                                cellStyle.backgroundColor = '#e2e8f0'; // slate-200
                                                cellStyle.fontWeight = '600'; // semibold
                                            }

                                            if (previewColWidthsInfo && previewColWidthsInfo[C]) {
                                                cellStyle.minWidth = `${Math.max(previewColWidthsInfo[C].wch * 7, 50)}px`; // Convert wch to approx px
                                            } else {
                                                cellStyle.minWidth = '80px'; // Default min width
                                            }
    
                                            let colSpan = 1, rowSpan = 1;
                                            const mergeMaster = mergedCellsLookup[`${R},${C}`];
                                            if (mergeMaster && mergeMaster !== 'slave' && mergeMaster.s) {
                                                colSpan = mergeMaster.s.e.c - mergeMaster.s.s.c + 1;
                                                rowSpan = mergeMaster.s.e.r - mergeMaster.s.s.r + 1;
                                            }
    
                                            return (
                                                <th key={`prev-h-${R}-${C}`} scope="col"
                                                    className="px-3 py-2.5 whitespace-normal break-words border border-slate-300"
                                                    style={cellStyle}
                                                    colSpan={colSpan} rowSpan={rowSpan}
                                                >
                                                    {cellContent}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white max-h-[calc(70vh-220px)] overflow-y-auto block">
                                {previewRowsData.length === 0 && 
                                    <tr><td colSpan={maxColsInPreview} className="p-4 text-center italic border border-slate-300">No data rows to preview.</td></tr>
                                }
                                {previewRowsData.slice(0, 50).map((dataRow, rowIndex) => (
                                    <tr key={`prev-r-${rowIndex}`} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'} hover:bg-sky-50/70 transition-colors`}>
                                        {dataRow.map((cellData, cellIndex) => (
                                            <td key={`prev-c-${rowIndex}-${cellIndex}`} 
                                                className="px-3 py-2 whitespace-normal break-words border border-slate-300"
                                                style={{ minWidth: (previewColWidthsInfo && previewColWidthsInfo[cellIndex]) ? `${Math.max(previewColWidthsInfo[cellIndex].wch * 7, 50)}px` : '80px', maxWidth: '300px' }}
                                                title={String(cellData)}
                                            >
                                                {String(cellData ?? '')}
                                            </td>
                                        ))}
                                        {/* Pad cells if dataRow is shorter than maxColsInPreview, unlikely with current data prep but good for robustness */}
                                        {dataRow.length < maxColsInPreview && 
                                          [...Array(maxColsInPreview - dataRow.length)].map((_, padIdx) => (
                                            <td key={`prev-pad-${rowIndex}-${padIdx}`} className="px-3 py-2 border border-slate-300" style={{minWidth: (previewColWidthsInfo && previewColWidthsInfo[dataRow.length + padIdx]) ? `${Math.max(previewColWidthsInfo[dataRow.length + padIdx].wch * 7, 50)}px` : '80px'}}></td>
                                          ))
                                        }
                                    </tr>
                                ))}
                                {rows.length > 50 && 
                                    <tr><td colSpan={maxColsInPreview} className="p-3 text-center italic text-slate-600 border border-slate-300">Showing first 50 of {rows.length} data rows.</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                        <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-sm">Cancel</button>
                        <button 
                            onClick={() => {
                                if (previewFormatType === 'TradingAccountFormat') exportAsTradingAccountFormat();
                                else if (previewFormatType === 'SimpleFormat') exportAsSimpleFormat();
                            }} 
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md"
                            aria-label={`Download as ${previewFileName}`}
                        >
                            Download ({previewFileName})
                        </button>
                    </div>
                </div>
            </div>
        );
    };    

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            <header className="mb-2">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Trading Account</h1>
                <p className="text-lg text-slate-700 mt-1">Manage and calculate trading account entries, and export data.</p>
            </header>

             {(error || successMessage) && (
                <div className="fixed top-20 right-5 z-[250] w-full max-w-md p-1"> {/* Ensure this has high z-index */}
                  {error && ( <div role="alert" className="mb-2"> <div className="bg-red-600 text-white font-semibold rounded-t-lg px-4 py-2 shadow-xl flex items-center"> Error </div> <div className="border border-t-0 border-red-500 rounded-b-lg bg-red-100 px-4 py-3 text-red-700 shadow-xl"><p className="text-sm whitespace-pre-wrap">{error}</p></div> </div> )}
                  {successMessage && ( <div role="alert"> <div className="bg-green-600 text-white font-semibold rounded-t-lg px-4 py-2 shadow-xl flex items-center"> Success </div> <div className="border border-t-0 border-green-500 rounded-b-lg bg-green-100 px-4 py-3 text-green-700 shadow-xl"><p className="text-sm whitespace-pre-wrap">{successMessage}</p></div> </div> )}
                </div>
            )}
            
            {formatSectionJsx}
            {entryFormSectionJsx}
            {fileUploadSectionJsx}
            {tableSectionJsx}
            
            {showExportChoiceModal && ExportChoiceModalJsx}
            {showPreviewModal && PreviewModalJsx()}
        </div>
    );
};

export default TradingAccountPage;
