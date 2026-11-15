export type WarehouseStock = {
  'RM Central': number;
  'RM Norte': number;
  'RM Oriente': number;
  'Sur Concepción': number;
  'Sur Puerto Montt': number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: WarehouseStock;
  imageUrl: string;
  category: string;
};

export type OrderStatus = 'Pendiente' | 'Aprobada' | 'Despachado';

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  lot?: string;
  expiryDate?: string;
};

export type Order = {
  id: string;
  clientName: string;
  date: string;
  total: number;
  status: OrderStatus;
  isUrgent: boolean;
  items: OrderItem[];
};
