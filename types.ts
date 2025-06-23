export interface Order {
  id: string; 
  orderNo: string;
  segment: string;
  subSegment: string;
  customerName: string;
  country: string;
  product: string;
  bonhoefferCode: string;
  qty: number;
  unitPrice: number;
  exportValue: number;
  supplier: string;
  priceInUSD: number;
  importValue: number;
  gp: number;
  gpPercentage: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderPostData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;


export enum Page {
  Home = 'Home',
  SupplierPrice = 'Supplier Price',
  Orders = 'Orders',
  ExploitView = 'Exploit View', 
  TradingAccount = 'Trading Account', // Added new page
  Dashboard = 'Dashboard',
  UserManagement = 'User Management',
  Help = 'Help',
}

declare global {
  interface Window {
    Papa: any;
    XLSX: any;
    jspdf: any; // For jsPDF library
  }
}

export interface SupplierPriceEntry {
  key: string; 
  supplierName: string;
  bonhoefferCode: string;
  lowestPurchasePriceUSD: number;
  orderNoAtLowestPrice: string;
  contributingOrderId: string; 
}

export interface DashboardProductEntry {
  productName: string;
  bonhoefferCode: string;
  totalExportValue: number;
  chartLabel: string; 
}

export enum AppPermission {
  CAN_VIEW_ORDERS = 'CAN_VIEW_ORDERS',
  CAN_EDIT_ORDERS = 'CAN_EDIT_ORDERS',
  CAN_IMPORT_EXPORT_ORDERS = 'CAN_IMPORT_EXPORT_ORDERS',
  CAN_VIEW_SUPPLIER_PRICES = 'CAN_VIEW_SUPPLIER_PRICES',
  CAN_EDIT_SUPPLIER_PRICES = 'CAN_EDIT_SUPPLIER_PRICES',
  CAN_VIEW_DASHBOARD = 'CAN_VIEW_DASHBOARD',
  CAN_MANAGE_USERS = 'CAN_MANAGE_USERS',
}

export type UserPermissionSet = {
  [key in AppPermission]?: boolean;
};

// User type for client-side storage, includes password
export interface User {
  id: string;
  username: string;
  password: string; // Password stored client-side for this version
  permissions: UserPermissionSet;
  isDefaultAdmin?: boolean; 
}

// Type for creating/updating a user client-side
export interface NewUserPayload extends Omit<User, 'id' | 'isDefaultAdmin'> {
  // Password is part of the User structure for client-side
}

// Types for Exploit View
export interface ExcelSheet {
  name: string;
  headers: string[]; // Kept for display convenience
  data: (string | number | boolean | null)[][]; // Kept for display convenience
  worksheet: any; // Stores the raw XLSX.Worksheet object to preserve formatting
}

export interface ExcelWorkbook {
  id: string; // Unique ID for the workbook
  fileName: string;
  sheets: ExcelSheet[];
  uploadedAt: Date; // Kept for individual workbook tracking
}

export interface ExploitFolder {
  id: string;
  name: string; // User-defined folder name (lowercase for matching)
  originalName: string; // Original casing for display
  workbooks: ExcelWorkbook[];
  createdAt: Date; // For sorting/displaying folders
}

export interface TradingAccountRow {
  id: string;
  inputBonhoefferCode: string;
  inputQty: number;
  inputCurrentUnitPrice: number;
  productName: string;
  currentTotalPrice: number;
  supplierName: string;
  supplierUnitPriceUSD: number;
  supplierTotalPriceUSD: number;
  gpUSD: number;
  gpPercentage: string;
}