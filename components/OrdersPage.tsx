
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Order, OrderPostData } from '../types'; 
import { parseOrderFile, exportOrdersToExcel, fetchAndParseGoogleSheet } from '../services/fileHandler';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ROWS_PER_PAGE = 100;
const GOOGLE_SHEET_URL_KEY = 'projectOrdersGoogleSheetUrl';
const LAST_REFRESH_TIME_KEY = 'projectOrdersLastRefreshTime';

const DEFAULT_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1PgyDPC8yDhZMxRua2WQ7KtUrSPaWVHs4yN0_T4k7dNM/edit?usp=sharing";

const AUTO_REFRESH_IS_ENABLED = true; 
const REFRESH_INTERVAL_FIXED_SECONDS = 1; // Changed from 60 to 1


// --- SVG Icons --- 
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>;
const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const CloudArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>;
const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
const CancelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const CashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.375 6.375 0 006.375-6.375V9.75A6.375 6.375 0 0012 3.375S5.625 9.75 5.625 12.375v.059A6.336 6.336 0 0012 18.75zm0-1.5a.75.75 0 00-.75.75v.75a.75.75 0 001.5 0v-.75a.75.75 0 00-.75-.75zm0-3.75a3 3 0 00-3 3h6a3 3 0 00-3-3z" />
  </svg>
);


interface OrdersPageProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>; 
  isLoadingOrders: boolean; 
  fetchOrders: () => Promise<void>; 
  apiRequest: (endpoint: string, method?: string, body?: any) => Promise<any>; 
}

interface TableHeader {
  key: keyof Order | 'actions' | 'serialNo';
  label: string;
  isEditable?: boolean;
  className?: string; 
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, setOrders, isLoadingOrders: initialIsLoading, fetchOrders, apiRequest }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessingClientAction, setIsProcessingClientAction] = useState(false); // For local actions like GSheet load, file upload, export, edit
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(
    () => localStorage.getItem(GOOGLE_SHEET_URL_KEY) || DEFAULT_GOOGLE_SHEET_URL
  );
  
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(() => {
    const savedTime = localStorage.getItem(LAST_REFRESH_TIME_KEY);
    return savedTime ? new Date(savedTime) : null;
  });

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editedOrderData, setEditedOrderData] = useState<Partial<Order> | null>(null);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiSection, setShowAiSection] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const autoRefreshIntervalRef = useRef<number | null>(null);
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(GOOGLE_SHEET_URL_KEY, googleSheetUrl);
  }, [googleSheetUrl]);
  
  useEffect(() => {
    if (lastRefreshTime) {
      localStorage.setItem(LAST_REFRESH_TIME_KEY, lastRefreshTime.toISOString());
    } else {
      localStorage.removeItem(LAST_REFRESH_TIME_KEY);
    }
  }, [lastRefreshTime]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000); 
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  useEffect(() => {
    if (aiError) {
      const timer = setTimeout(() => setAiError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [aiError]);


  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingClientAction(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const parsedOrdersFromFile: Order[] = await parseOrderFile(file); 
      
      // Assuming direct client-side update or specific backend logic for this demo
      setOrders(prevOrders => [...prevOrders, ...parsedOrdersFromFile].filter((order, index, self) => 
          index === self.findIndex((o) => o.orderNo === order.orderNo) // Basic de-duplication by orderNo
      ));
      setSuccessMessage(`${parsedOrdersFromFile.length} orders from ${file.name} parsed and added/updated locally.`);
      
      // If you were to send to backend:
      // if (parsedOrdersFromFile.length > 0) {
      //   await apiRequest('/orders/batch', 'POST', { orders: parsedOrdersFromFile });
      //   setSuccessMessage(`${parsedOrdersFromFile.length} orders from ${file.name} sent to server. App will re-fetch data.`);
      //   await fetchOrders(); 
      // } else {
      //   setSuccessMessage(`No orders found in ${file.name} to import.`);
      // }
      setCurrentPage(1);
    } catch (err) {
      console.error("File upload error details:", err);
      setError(err instanceof Error ? err.message : 'Failed to parse or submit file.');
    } finally {
      setIsProcessingClientAction(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [apiRequest, fetchOrders, setOrders]);


  const performGoogleSheetLoadAndSubmit = useCallback(async (isAutoRefresh: boolean = false) => {
    if (!googleSheetUrl.trim()) {
      if (!isAutoRefresh) setError("Please enter a Google Sheet URL.");
      return false;
    }
    const sheetIdRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = googleSheetUrl.match(sheetIdRegex);
    if (!match || !match[1]) {
      const errMsg = "Invalid Google Sheet URL. Ensure it's in the format '.../spreadsheets/d/SHEET_ID/...'.";
      if (!isAutoRefresh) setError(errMsg); else console.warn("Auto-refresh: " + errMsg);
      return false;
    }
    const sheetId = match[1];

    if (!isAutoRefresh) setIsProcessingClientAction(true);
    if (!isAutoRefresh) setError(null);
    if (!isAutoRefresh) setSuccessMessage(null);

    console.log(`OrdersPage: ${isAutoRefresh ? 'Auto-refreshing' : 'Manually loading'} Google Sheet ID ${sheetId}`);

    try {
      const parsedOrdersFromSheet: Order[] = await fetchAndParseGoogleSheet(sheetId);
      
      setOrders(parsedOrdersFromSheet); 
      
      if (parsedOrdersFromSheet.length > 0) {
        if (!isAutoRefresh) setSuccessMessage(`${parsedOrdersFromSheet.length} orders loaded directly from Google Sheet.`);
        console.log(`OrdersPage: Successfully loaded ${parsedOrdersFromSheet.length} orders from Google Sheet.`);
      } else {
        if (!isAutoRefresh) setSuccessMessage(`No orders found in Google Sheet or sheet is empty.`);
         console.log(`OrdersPage: No orders found in Google Sheet ID ${sheetId}.`);
      }

      setLastRefreshTime(new Date());
      setCurrentPage(1);
      return true;
    } catch (err) {
      let detailedErrorMessage = 'An unknown error occurred while loading data from Google Sheet.';
      if (err instanceof Error) {
        detailedErrorMessage = err.message;
      }
      if (!isAutoRefresh) setError(detailedErrorMessage); 
      console.error(`OrdersPage: ${isAutoRefresh ? 'Auto-refresh' : 'Manual load'} error: ${detailedErrorMessage}`);
      return false;
    } finally {
      if (!isAutoRefresh) setIsProcessingClientAction(false);
    }
  }, [googleSheetUrl, setOrders]);


  useEffect(() => {
    const clearCurrentInterval = () => {
      if (autoRefreshIntervalRef.current !== null) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
    };

    if (AUTO_REFRESH_IS_ENABLED && googleSheetUrl.trim()) {
      clearCurrentInterval(); 
      autoRefreshIntervalRef.current = window.setInterval(async () => {
        console.log(`OrdersPage: Auto-refresh triggered at ${new Date().toLocaleTimeString()}`);
        await performGoogleSheetLoadAndSubmit(true); 
      }, REFRESH_INTERVAL_FIXED_SECONDS * 1000);

    } else {
      clearCurrentInterval();
    }
    return () => clearCurrentInterval();
  }, [googleSheetUrl, performGoogleSheetLoadAndSubmit]);

   useEffect(() => {
    // Initial load from default sheet only if no orders and default URL is set.
    // This avoids reloading if user has already changed URL or orders exist.
    if (orders.length === 0 && googleSheetUrl.trim() && localStorage.getItem(GOOGLE_SHEET_URL_KEY) === null) { 
      console.log("OrdersPage: Attempting initial load from default Google Sheet because no orders and URL is default.");
      performGoogleSheetLoadAndSubmit(true); 
    }
  }, []); // Runs once on mount. Dependencies like `orders.length` and `googleSheetUrl` are for the condition inside.

  const handleManualLoadSheet = useCallback(() => {
    performGoogleSheetLoadAndSubmit(false);
  }, [performGoogleSheetLoadAndSubmit]);

  const handleExport = useCallback(() => {
    if (orders.length === 0) {
      setError("No data to export.");
      return;
    }
    setIsProcessingClientAction(true); 
    setError(null);
    setSuccessMessage(null);
    try {
      exportOrdersToExcel(orders, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMessage("Orders exported successfully.");
    } catch (err) {
       console.error("Export error details:",err);
       setError(err instanceof Error ? err.message : 'Failed to export data.');
    } finally {
      setIsProcessingClientAction(false);
    }
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return orders.filter(order =>
      Object.values(order).some(value =>
        String(value).toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ROWS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const dashboardMetrics = useMemo(() => {
    const uniqueOrderNos = new Set(orders.map(order => order.orderNo));
    const totalOrderCount = uniqueOrderNos.size;
    const totalSellPrice = orders.reduce((sum, order) => sum + (order.exportValue || 0), 0);
    const totalPurchasePrice = orders.reduce((sum, order) => sum + (order.importValue || 0), 0);
    const totalQty = orders.reduce((sum, order) => sum + (order.qty || 0), 0);
    return { totalOrderCount, totalSellPrice, totalPurchasePrice, totalQty };
  }, [orders]);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const orderTableHeaders: TableHeader[] = [
    { key: 'serialNo', label: 'S.No', className: 'w-16 text-center' },
    { key: 'status', label: 'Status', isEditable: false, className: 'w-28' },
    { key: 'orderNo', label: 'Order No', isEditable: true, className: 'w-36' },
    { key: 'segment', label: 'Segment', isEditable: true, className: 'w-32' },
    { key: 'subSegment', label: 'Sub Segment', isEditable: true, className: 'w-32' },
    { key: 'customerName', label: 'Customer', isEditable: true, className: 'min-w-[150px]' },
    { key: 'country', label: 'Country', isEditable: true, className: 'w-28' },
    { key: 'product', label: 'Product', isEditable: true, className: 'min-w-[200px]' },
    { key: 'bonhoefferCode', label: 'B. Code', isEditable: true, className: 'w-32' },
    { key: 'qty', label: 'Qty', isEditable: true, className: 'w-20 text-right' },
    { key: 'unitPrice', label: 'Sell Price', isEditable: true, className: 'w-32 text-right' },
    { key: 'exportValue', label: 'Total Sell', isEditable: true, className: 'w-32 text-right' },
    { key: 'supplier', label: 'Supplier', isEditable: true, className: 'min-w-[150px]' },
    { key: 'priceInUSD', label: 'Purchase Price', isEditable: true, className: 'w-36 text-right' },
    { key: 'importValue', label: 'Total Purchase', isEditable: true, className: 'w-36 text-right' },
    { key: 'gp', label: 'GP (USD)', isEditable: true, className: 'w-28 text-right' },
    { key: 'gpPercentage', label: 'GP %', isEditable: true, className: 'w-24 text-right' },
    { key: 'actions', label: 'Actions', className: 'w-28 text-center sticky right-0 bg-slate-200/70 z-10' }, 
  ];

  const handleEditClick = useCallback((order: Order) => {
    setEditingOrderId(order.id);
    setEditedOrderData({ ...order }); 
  }, []);

  const handleCancelClick = useCallback(() => {
    setEditingOrderId(null);
    setEditedOrderData(null);
  }, []);

  const handleSaveClick = useCallback(async () => {
    if (!editingOrderId || !editedOrderData) return;
    setIsProcessingClientAction(true);
    setError(null);
    try {
        const updatedOrders = orders.map(o => {
            if (o.id === editingOrderId) {
                const updatedOrder = { ...o, ...editedOrderData } as Order;

                // Recalculate dependent fields
                const qty = typeof updatedOrder.qty === 'number' ? updatedOrder.qty : 0;
                const unitPrice = typeof updatedOrder.unitPrice === 'number' ? updatedOrder.unitPrice : 0;
                const priceInUSD = typeof updatedOrder.priceInUSD === 'number' ? updatedOrder.priceInUSD : 0;

                updatedOrder.exportValue = qty * unitPrice;
                updatedOrder.importValue = qty * priceInUSD;
                updatedOrder.gp = updatedOrder.exportValue - updatedOrder.importValue;
                
                if (updatedOrder.exportValue !== 0) {
                    updatedOrder.gpPercentage = `${((updatedOrder.gp / updatedOrder.exportValue) * 100).toFixed(2)}%`;
                } else {
                    updatedOrder.gpPercentage = '0.00%';
                }
                return updatedOrder;
            }
            return o;
        });
        setOrders(updatedOrders);
        setSuccessMessage('Order updated locally. Calculations refreshed.');
      
      // If you were to send to backend:
      // const payload: Partial<Order> = { ...editedOrderData };
      // delete payload.id; 
      // await apiRequest(`/orders/${editingOrderId}`, 'PUT', payload);
      // setSuccessMessage('Order update request sent to server. App will re-fetch data.');
      // await fetchOrders(); 
      
      setEditingOrderId(null);
      setEditedOrderData(null);
    } catch (apiError: any) {
      setError(apiError.message || 'Failed to update order.');
    } finally {
      setIsProcessingClientAction(false);
    }
  }, [editingOrderId, editedOrderData, apiRequest, fetchOrders, orders, setOrders]);


  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, fieldKey: keyof Order) => {
    if (!editedOrderData) return;
    const { value, type } = event.target;
    let processedValue: string | number = value;

    if (fieldKey === 'gpPercentage') {
        processedValue = value; 
    } else if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value); // Allow empty string for clearing number inputs
    }
    setEditedOrderData(prev => ({ ...prev, [fieldKey]: processedValue }));
  }, [editedOrderData]);

  const getInputType = (key: keyof Order): string => {
    if (['qty', 'unitPrice', 'priceInUSD'].includes(key)) return 'number'; // exportValue, importValue, gp are calculated
    if (key === 'gpPercentage') return 'text'; 
    return 'text';
  };

  const getDisplayValue = (order: Order, fieldKey: keyof Order): string | JSX.Element => {
    const value = order[fieldKey];
    if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
      if (fieldKey === 'status') return <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">N/A</span>;
      if (typeof order[fieldKey] === 'number' && ['unitPrice', 'exportValue', 'priceInUSD', 'importValue', 'gp'].includes(fieldKey)) return (0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      if (fieldKey === 'gpPercentage') return '0.00%';
      return '';
    }
    if (typeof value === 'number' && ['unitPrice', 'exportValue', 'priceInUSD', 'importValue', 'gp'].includes(fieldKey)) {
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
     if (fieldKey === 'gpPercentage' && typeof value === 'string') {
        if (!value.includes('%')) {
            const numVal = parseFloat(value);
            return isNaN(numVal) ? value : `${numVal.toFixed(2)}%`;
        }
        return value; // Already formatted
    }
    if (fieldKey === 'status') {
        let bgColor = 'bg-slate-200'; let textColor = 'text-slate-700'; 
        const lowerStatus = String(value).toLowerCase();
        if (lowerStatus === 'completed' || lowerStatus === 'delivered') { bgColor = 'bg-green-100'; textColor = 'text-green-800'; }
        else if (lowerStatus === 'pending' || lowerStatus === 'processing') { bgColor = 'bg-amber-100'; textColor = 'text-amber-800'; }
        else if (lowerStatus === 'cancelled' || lowerStatus === 'failed') { bgColor = 'bg-red-100'; textColor = 'text-red-800'; }
        return <span className={`text-xs font-medium ${bgColor} ${textColor} px-2.5 py-1 rounded-full whitespace-nowrap`}>{String(value)}</span>;
    }
    return String(value);
  };

  const getEditableValue = (orderData: Partial<Order>, fieldKey: keyof Order): string | number => {
      const value = orderData[fieldKey];
      if (fieldKey === 'gpPercentage' && typeof value === 'string') {
          return value.includes('%') ? value.replace('%', '') : value;
      }
      if (typeof value === 'number' && isNaN(value)) return ''; // Return empty string for NaN in input
      return value ?? ''; // Return empty string for null/undefined
  };

  const handleAskAI = async () => {
    if (!aiQuery.trim() || filteredOrders.length === 0) {
      setAiError("Please type a question. AI analysis requires orders to be loaded.");
      return;
    }
    if (!process.env.API_KEY) {
      setAiError("Gemini API key is not configured. Please set the API_KEY environment variable.");
      return;
    }
    setIsAskingAI(true);
    setAiResponse(null);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const columnDescriptions = orderTableHeaders
        .filter(h => h.key !== 'actions' && h.key !== 'serialNo')
        .map(h => `${h.label} (key: ${String(h.key)})`)
        .join('; ');

      const dataSample = filteredOrders.slice(0, 30); 
      
      const sanitizedSample = dataSample.map(order => {
          const cleanOrder: Partial<Order> = {};
          orderTableHeaders.forEach(header => {
              if (header.key !== 'actions' && header.key !== 'serialNo') {
                  const key = header.key as keyof Order;
                  (cleanOrder[key] as any) = order[key] !== undefined ? order[key] : null;
              }
          });
          return cleanOrder;
      });


      const prompt = `
        You are an AI assistant helping to analyze order data.
        The available order data has the following columns: ${columnDescriptions}.
        Here is a sample of the current order data (up to 30 records):
        ${JSON.stringify(sanitizedSample, null, 2)}

        Based *only* on the provided data sample, please answer the following question:
        "${aiQuery}"

        Provide a concise, text-based answer. Do not refer to any external data or make assumptions beyond what's given in the sample. If the data is insufficient to answer, state that clearly.
      `;
      
      const result: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
      });
      
      setAiResponse(result.text);

    } catch (error: any) {
      console.error("Gemini API error:", error);
      let message = "Failed to get response from AI.";
      if (error.message) {
        message += ` Details: ${error.message}`;
      }
      setAiError(message);
    } finally {
      setIsAskingAI(false);
    }
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <header className="mb-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Project Orders Management</h1>
        <p className="text-lg text-slate-700 mt-1">Import, view, edit, and export your project orders seamlessly.</p>
      </header>
      
      {/* Alert Messages Container */}
      {(error || successMessage || aiError) && (
        <div className="fixed top-20 right-5 z-[100] w-full max-w-md p-1">
          {error && (
            <div role="alert">
              <div className="bg-red-600 text-white font-semibold rounded-t-lg px-4 py-2 shadow-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Error
              </div>
              <div className="border border-t-0 border-red-500 rounded-b-lg bg-red-100 px-4 py-3 text-red-700 shadow-xl"><p className="text-sm">{error}</p></div>
            </div>
          )}
          {successMessage && (
             <div role="alert">
              <div className="bg-green-600 text-white font-semibold rounded-t-lg px-4 py-2 shadow-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Success
              </div>
              <div className="border border-t-0 border-green-500 rounded-b-lg bg-green-100 px-4 py-3 text-green-700 shadow-xl"><p className="text-sm">{successMessage}</p></div>
            </div>
          )}
           {aiError && (
            <div role="alert" className="mt-2">
              <div className="bg-amber-600 text-white font-semibold rounded-t-lg px-4 py-2 shadow-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  AI Assistant Error
              </div>
              <div className="border border-t-0 border-amber-500 rounded-b-lg bg-amber-100 px-4 py-3 text-amber-700 shadow-xl"><p className="text-sm">{aiError}</p></div>
            </div>
          )}
        </div>
      )}

      <section aria-labelledby="data-controls-title" className="bg-white p-6 rounded-xl shadow-2xl space-y-6">
        <h2 id="data-controls-title" className="sr-only">Data Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="p-5 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
              <UploadIcon className="w-6 h-6 mr-2 text-sky-600" />
              File Operations
            </h3>
            <div className="space-y-3">
              <div>
                  <label htmlFor="file-upload" className={`inline-flex items-center px-5 py-3 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-105 ${isProcessingClientAction || initialIsLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <UploadIcon className="w-5 h-5 mr-2.5" />
                    {isProcessingClientAction && !initialIsLoading ? 'Processing...' : (initialIsLoading ? 'Loading...' : 'Import Orders (CSV/Excel)')}
                  </label>
                  <input id="file-upload" type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".csv,.xls,.xlsx" disabled={isProcessingClientAction || initialIsLoading || isAskingAI}/>
                  <p className="mt-1.5 text-xs text-slate-600">Upload new orders. They will be added to the existing data if IDs are unique, or update existing orders.</p>
              </div>
              <button onClick={handleExport} disabled={isProcessingClientAction || orders.length === 0 || isAskingAI} className="w-full inline-flex items-center justify-center px-5 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed">
                <DownloadIcon className="w-5 h-5 mr-2.5" />
                Export All Orders (Excel)
              </button>
            </div>
          </div>

          <div className="p-5 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
              <CloudArrowDownIcon className="w-6 h-6 mr-2 text-sky-600" />
              Google Sheet Integration
            </h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="googleSheetUrl" className="block text-xs font-medium text-slate-700 mb-1">Google Sheet URL:</label>
                <div className="flex">
                  <input
                    type="text"
                    id="googleSheetUrl"
                    value={googleSheetUrl}
                    onChange={(e) => {
                      setGoogleSheetUrl(e.target.value);
                      setLastRefreshTime(null); // Reset refresh time on URL change
                      setError(null); // Clear errors on URL change
                    }}
                    placeholder="Enter Google Sheet URL (e.g., .../edit?usp=sharing)"
                    className="flex-grow px-3 py-2 border border-slate-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-50"
                    disabled={isProcessingClientAction || initialIsLoading || isAskingAI}
                    aria-label="Google Sheet URL"
                  />
                  <button 
                    onClick={handleManualLoadSheet} 
                    disabled={isProcessingClientAction || initialIsLoading || !googleSheetUrl.trim() || isAskingAI}
                    className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-r-md shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center"
                    title={AUTO_REFRESH_IS_ENABLED ? `Manual Load (Auto-refresh is ON every ${REFRESH_INTERVAL_FIXED_SECONDS}s)` : "Manual Load (Auto-refresh is OFF)"}
                  >
                    <RefreshIcon className={`w-5 h-5 ${isProcessingClientAction || initialIsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                 <p className="mt-1.5 text-xs text-slate-600">
                  {AUTO_REFRESH_IS_ENABLED && googleSheetUrl.trim() ? 
                    `Auto-refreshing every ${REFRESH_INTERVAL_FIXED_SECONDS}s. ` : 
                    (AUTO_REFRESH_IS_ENABLED && !googleSheetUrl.trim() ? "Auto-refresh enabled but no URL. " : "Auto-refresh is disabled. ")
                  }
                  Last refresh: {lastRefreshTime ? lastRefreshTime.toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
         <div className="pt-5 border-t border-slate-200 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input 
                type="text" 
                placeholder="Search all fields in current orders..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3.5 py-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full sm:w-2/3 text-sm transition-all duration-150"
                aria-label="Search orders table"
                disabled={isAskingAI}
            />
        </div>
      </section>

      {/* AI Analysis Section */}
      <section aria-labelledby="ai-analysis-title" className="bg-white p-6 rounded-xl shadow-2xl">
        <details className="group" onToggle={(e) => setShowAiSection((e.target as HTMLDetailsElement).open)}>
          <summary className="flex justify-between items-center font-semibold text-slate-800 cursor-pointer hover:text-sky-700 list-none text-lg">
            <div className="flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2 text-sky-600 group-open:text-sky-700 transition-colors" />
              AI-Powered Order Analysis
            </div>
            <span className="text-sky-600 group-hover:text-sky-800 transition-transform duration-300 transform group-open:rotate-180">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </span>
          </summary>
          {showAiSection && (
            <div className="mt-6 space-y-4 pt-4 border-t border-slate-200">
              <div>
                <label htmlFor="aiQuery" className="block text-sm font-semibold text-slate-700 mb-1">Ask a question about your current orders:</label>
                <textarea
                  id="aiQuery"
                  ref={aiTextareaRef}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-50"
                  placeholder="e.g., 'What are the top 3 most expensive products by total sell price?' or 'Which supplier has the most orders?'"
                  disabled={isAskingAI || filteredOrders.length === 0 || !process.env.API_KEY}
                  aria-label="AI query input"
                />
                 <p className="mt-1 text-xs text-slate-500">
                  AI analysis is based on a sample of the currently filtered orders (up to 30 records). 
                  { !process.env.API_KEY && <span className="text-red-600 font-semibold"> Gemini API Key not detected. AI features disabled.</span>}
                </p>
              </div>
              <button
                onClick={handleAskAI}
                disabled={isAskingAI || !aiQuery.trim() || filteredOrders.length === 0 || !process.env.API_KEY}
                className="inline-flex items-center px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAskingAI ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Asking AI...
                  </>
                ) : (
                  <>
                    <LightBulbIcon className="w-5 h-5 mr-2" />
                    Ask AI
                  </>
                )}
              </button>
              {isAskingAI && <p className="text-sm text-slate-600 animate-pulse">Waiting for response from Gemini...</p>}
              
              {aiResponse && !isAskingAI && (
                <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h4 className="text-md font-semibold text-slate-800 mb-2">AI Response:</h4>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans bg-white p-3 rounded shadow-inner max-h-60 overflow-y-auto">{aiResponse}</pre>
                </div>
              )}
            </div>
          )}
        </details>
      </section>


      <section aria-labelledby="key-metrics-title" className="bg-white p-6 rounded-xl shadow-2xl">
        <h2 id="key-metrics-title" className="text-xl font-semibold text-slate-800 mb-4 border-b pb-3">Key Metrics Overview</h2>
        {initialIsLoading && <p className="text-slate-600">Loading metrics...</p>}
        {!initialIsLoading && orders.length === 0 && <p className="text-slate-600">No orders loaded. Import data to see metrics.</p>}
        {!initialIsLoading && orders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-sky-50 rounded-lg shadow-md border border-sky-200">
                <ShoppingCartIcon className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-sky-700">{dashboardMetrics.totalOrderCount.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg shadow-md border border-green-200">
                <CashIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Total Sell Value</p>
                <p className="text-2xl font-bold text-green-700">{dashboardMetrics.totalSellPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg shadow-md border border-red-200">
                <CashIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Total Purchase Value</p>
                <p className="text-2xl font-bold text-red-700">{dashboardMetrics.totalPurchasePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
             <div className="p-4 bg-purple-50 rounded-lg shadow-md border border-purple-200">
                <ChartBarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Total Quantity</p>
                <p className="text-2xl font-bold text-purple-700">{dashboardMetrics.totalQty.toLocaleString()}</p>
            </div>
            </div>
        )}
      </section>

      <section aria-labelledby="orders-table-title" className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <h2 id="orders-table-title" className="sr-only">Detailed Orders List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-800">
            <thead className="text-xs text-slate-800 uppercase bg-slate-200/70 sticky top-0 z-20">
              <tr>
                {orderTableHeaders.map(header => (
                  <th key={header.key.toString()} scope="col" className={`px-4 py-3.5 whitespace-nowrap tracking-wider font-semibold ${header.className || ''} ${header.key === 'actions' ? 'sticky right-0 bg-slate-200/70 z-30' : ''}`}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialIsLoading ? (
                <tr><td colSpan={orderTableHeaders.length} className="px-6 py-12 text-center text-slate-600">Loading orders data...</td></tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, paginatedIndex) => {
                  const isEditing = order.id === editingOrderId;
                  return (
                    <tr key={order.id} className={`transition-colors duration-150 ${isEditing ? 'bg-sky-50 ring-2 ring-sky-400 z-20 relative' : (paginatedIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70')} hover:bg-sky-50/50`}>
                      {orderTableHeaders.map(header => {
                        const cellClassName = `px-4 py-2.5 whitespace-nowrap ${header.className || ''} ${isEditing && header.isEditable ? 'py-1.5' : ''}`;
                        if (header.key === 'actions') {
                          return (
                            <td key={`${order.id}-actions`} className={`${cellClassName} sticky right-0 ${isEditing ? 'bg-sky-50' : (paginatedIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70')} group-hover:bg-sky-50/50 z-10`}>
                              {isEditing ? (
                                <div className="flex items-center space-x-2 justify-center">
                                  <button onClick={handleSaveClick} className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-all" aria-label="Save order" disabled={isProcessingClientAction}>
                                    <SaveIcon className="w-5 h-5" />
                                  </button>
                                  <button onClick={handleCancelClick} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-all" aria-label="Cancel edit" disabled={isProcessingClientAction}>
                                    <CancelIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              ) : (
                                 <div className="flex justify-center">
                                <button 
                                  onClick={() => handleEditClick(order)} 
                                  className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-100 rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed" 
                                  disabled={editingOrderId !== null && editingOrderId !== order.id || isProcessingClientAction || isAskingAI}
                                  aria-label={`Edit order ${order.orderNo}`}
                                >
                                  <EditIcon className="w-5 h-5" />
                                </button>
                                </div>
                              )}
                            </td>
                          );
                        }
                        if (header.key === 'serialNo') {
                           return ( <td key={`${order.id}-serialNo`} className={cellClassName}> {(currentPage - 1) * ROWS_PER_PAGE + paginatedIndex + 1} </td> );
                        }
                        const fieldKey = header.key as keyof Order;
                        return (
                          <td key={`${order.id}-${fieldKey}`} className={cellClassName}>
                            {isEditing && header.isEditable && editedOrderData ? (
                              <input
                                type={getInputType(fieldKey)}
                                value={getEditableValue(editedOrderData, fieldKey)}
                                onChange={(e) => handleInputChange(e, fieldKey)}
                                className="px-2 py-1.5 border border-slate-300 rounded-md w-full text-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out bg-white shadow-sm"
                                aria-label={`Edit ${header.label}`}
                                step={getInputType(fieldKey) === 'number' ? 'any' : undefined}
                                disabled={isProcessingClientAction || 
                                    ['exportValue', 'importValue', 'gp', 'status'].includes(fieldKey) || // Calculated fields or status not directly editable here
                                    (fieldKey === 'gpPercentage' && editedOrderData.exportValue === 0) // Prevent editing GP% if no sell price
                                }
                              />
                            ) : ( getDisplayValue(order, fieldKey) )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={orderTableHeaders.length} className="px-6 py-12 text-center text-slate-600">
                    {searchTerm ? 'No orders match your search criteria.' : 'No orders data available. Use the controls above to import or load data.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > ROWS_PER_PAGE && (
          <div className="px-4 py-4 flex items-center justify-between border-t border-slate-200 bg-white sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={handlePrevPage} disabled={currentPage === 1 || isProcessingClientAction || initialIsLoading || isAskingAI} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-800 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages || isProcessingClientAction || initialIsLoading || isAskingAI} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-800 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">Next</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-800">
                    Showing <span className="font-semibold">{Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filteredOrders.length)}</span> to <span className="font-semibold">{Math.min(currentPage * ROWS_PER_PAGE, filteredOrders.length)}</span> of <span className="font-semibold">{filteredOrders.length}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button onClick={handlePrevPage} disabled={currentPage === 1 || isProcessingClientAction || initialIsLoading || isAskingAI} className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border-y border-slate-300 bg-white text-sm font-medium text-slate-800">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages || isProcessingClientAction || initialIsLoading || isAskingAI} className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                    </nav>
                </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrdersPage;
