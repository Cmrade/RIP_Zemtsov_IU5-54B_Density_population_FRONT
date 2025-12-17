export interface Population {
  id: number;
  title: string;
  image: string;
  main_information: string;
  more_information: string;
  app_flag: boolean;
  building_density: number;
  people_per_building: number;
}

// Добавим тип для фильтров
export interface FiltersState {
  searchTerm: string;
  serviceType?: string;
  sortBy?: string;
}