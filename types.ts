
export interface Kost {
  id: string;
  name: string;
  area: string; // e.g., 'Lowokwaru', 'Klojen'
  address: string;
  pricePerMonth: number;
  rating: number;
  imageUrls: string[];
  description: string;
  facilities: string[];
  nearbyCampuses: string[];
  contactLink?: string;
  isArchived?: boolean;
  gender: 'Putra' | 'Putri' | 'Campur';
}

export interface FilterState {
    area: string;
    campuses: string[];
    facilities: string[];
    maxPrice: number;
    gender: 'Semua' | 'Putra' | 'Putri' | 'Campur';
}

export interface HistoryLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'unarchive' | 'restore';
  kostName: string;
  kostId: string;
  timestamp: string; // ISO string
  details?: string;
  previousState?: Kost;
  isRestored?: boolean;
}