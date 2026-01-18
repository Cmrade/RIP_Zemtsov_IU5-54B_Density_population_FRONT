// types/index.ts
export interface Population {
  id: number;
  title: string;
  image?: string;
  main_information: string;
  more_information?: string;
  building_density?: number;
  people_per_building?: number;
  media_files?: MediaFile[];
  media_count?: number;
}

// Новый интерфейс для популяций с оценкой AI
export interface PopulationWithScore extends Population {
  score?: number;
  isVisible?: boolean;
}

export interface MediaFile {
  id: number;
  population_id: number;
  file_url: string;
  file_type: 'image' | 'video';
  upload_at: string;
  clip_embedding?: any;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  token?: string;
}

export interface CartItem {
  id: number;
  order: number;
  order_title: string;
  order_image: string;
  comment: string;
}

export interface PopulationInDensityCalculation {
  id: number;
  population: Population;
  comment: string;
  order_title?: string;
  order_image?: string;
}

export interface DensityCalculation {
  id: number;
  status: 'DRAFT' | 'FORMED' | 'COMPLETED' | 'REJECTED' | 'DELETED';
  title: string | null;
  description: string | null;
  territory_area: number | null;
  calculated_population: number | null;
  creation_datetime: string;
  formation_datetime: string | null;
  completion_datetime: string | null;
  client: number | null;
  manager: number | null;
  client_username: string | null;
  manager_username: string | null;
  client_email: string | null;
  populations: PopulationInDensityCalculation[];
  populations_count: number;
}