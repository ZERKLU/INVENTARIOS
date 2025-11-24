
export enum Category {
  DULCERIA = 'Dulcería',
  JARCERIA = 'Jarcería',
  DORILOCOS = 'Dorilocos'
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category | string;
  quantity: number;
  price: number;
  description: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
  batchNumber?: string;
}

export type MovementType = 'entry' | 'exit';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  timestamp: number;
  batchNumber?: string;
  salePrice?: number; // Precio al que se vendió (unitario) en el momento de la salida
  purchasePrice?: number; // Precio al que se compró (unitario) en el momento de la entrada
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categoryDistribution: { name: string; value: number }[];
}