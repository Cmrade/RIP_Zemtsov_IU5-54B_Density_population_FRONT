export interface Order {
  id: number;
  title: string;
  image: string;
  main_information: string;
  more_information: string;
  app_flag: boolean;
  building_density?: number;
  people_per_building?: number;
}

export interface CartInfo {
  application_id: number;
  orders_count: number;
}