export interface Product {
  category: string;
  name: string;
  pdfPage: number;
  costMenudeo: number;
  costMayoreo: number;
  costDistribuidor: number;
  priceMenudeo: number;
  priceMayoreo: number;
  priceDistribuidor: number;
  profitMenudeo: number;
  profitMenudeoPercent: string;
  profitMayoreo: number;
  profitMayoreoPercent: string;
  profitDistribuidor: number;
  profitDistribuidorPercent: string;
  notes: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  saleType: 'Menudeo' | 'Mayoreo' | 'Distribuidor';
  finalPrice: number;
  cost: number;
  profit: number;
}

export interface Sale {
  id?: string;
  items: SaleItem[];
  totalPrice: number;
  totalCost: number;
  totalProfit: number;
  date: string; // ISO string
  clientName?: string;
  timestamp: any; // Firestore timestamp
}

export interface DashboardStats {
  totalProfitMonth: number;
  totalSalesMonth: number;
  orderCountMonth: number;
  averageTicket: number;
  weeklyProfits: { week: string; profit: number }[];
  categorySales: { category: string; count: number }[];
  topProfitableProducts: { name: string; profit: number }[];
  topSellingProducts: { name: string; count: number }[];
}
