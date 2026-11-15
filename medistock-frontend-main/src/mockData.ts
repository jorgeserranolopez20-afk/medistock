import { Product, Order } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'P001',
    name: 'Monitor de Signos Vitales Multiparámetro',
    description: 'Monitor avanzado con pantalla táctil de 12", medición de ECG, SpO2, PNI y capnografía opcional. Ideal para UCI y urgencias.',
    price: 1250000,
    category: 'Equipos Médicos',
    imageUrl: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&q=80&w=400',
    stock: {
      'RM Central': 15,
      'RM Norte': 5,
      'RM Oriente': 2,
      'Sur Concepción': 3,
      'Sur Puerto Montt': 1
    }
  },
  {
    id: 'P002',
    name: 'Guantes de Nitrilo Azules (Caja x100)',
    description: 'Guantes de examen de nitrilo sin polvo, alta resistencia a perforaciones y químicos. Grado médico certificado. Talla M.',
    price: 8500,
    category: 'Insumos Clínicos',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1675704981881-804d9c7c4b8b?auto=format&fit=crop&q=80&w=400',
    stock: {
      'RM Central': 1500,
      'RM Norte': 800,
      'RM Oriente': 1200,
      'Sur Concepción': 500,
      'Sur Puerto Montt': 300
    }
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    clientName: 'Hospital Clínico San Carlos',
    date: '2026-05-24T10:30:00Z',
    total: 2508500,
    status: 'Pendiente',
    isUrgent: true,
    items: [
      {
        productId: 'P001',
        productName: 'Monitor de Signos Vitales Multiparámetro',
        quantity: 2,
        lot: 'EQ-2026-A1',
        expiryDate: 'N/A'
      },
      {
        productId: 'P002',
        productName: 'Guantes de Nitrilo Azules (Caja x100)',
        quantity: 1,
        lot: 'L-884920',
        expiryDate: '2028-12-01'
      }
    ]
  },
  {
    id: 'ORD-2026-002',
    clientName: 'Centro Médico Arrayán',
    date: '2026-05-24T11:15:00Z',
    total: 170000,
    status: 'Pendiente',
    isUrgent: false,
    items: [
      {
        productId: 'P002',
        productName: 'Guantes de Nitrilo Azules (Caja x100)',
        quantity: 20,
        lot: 'L-884920',
        expiryDate: '2028-12-01'
      }
    ]
  },
  {
    id: 'ORD-2026-003',
    clientName: 'Clínica Dental Sonrisas',
    date: '2026-05-23T15:45:00Z',
    total: 42500,
    status: 'Aprobada',
    isUrgent: false,
    items: [
      {
        productId: 'P002',
        productName: 'Guantes de Nitrilo Azules (Caja x100)',
        quantity: 5,
        lot: 'L-884921',
        expiryDate: '2029-01-15'
      }
    ]
  }
];
