// mockData.ts
import { Population } from '../types';

export const MOCK_POPULATIONS: Population[] = [
  {
    id: 1,
    title: 'Древний город',
    image: 'http://localhost:9000/static/img/town.png',
    main_information: 'плотность ≈ 110 ч/га',
    more_information: 'Это основная жилая зона с усадебной застройкой. Плотность здесь была заметно ниже.\n\nплотность населения ≈ 110 ч/га\nплотность застройки ≈ 17 усадеб/га\nколичество жильцов в усадьбе ≈ 6 ч/ус',
    app_flag: false,
    building_density: 17,
    people_per_building: 6
  },
  {
    id: 2,
    title: 'Крепость', 
    image: 'http://localhost:9000/static/img/tower.png',
    main_information: 'плотность ≈ 135 ч/га',
    more_information: 'Здесь наблюдалась максимальная плотность, обусловленная дефицитом защищенного пространства.\n\nплотность населения ≈ 135 ч/га\nплотность застройки ≈ 25 усадеб/га\nколичество жильцов в усадьбе ≈ 5 ч/ус',
    app_flag: true,
    building_density: 25,
    people_per_building: 5
  },
  {
    id: 3,
    title: 'Село',
    image: 'http://localhost:9000/static/img/village.png',
    main_information: 'плотность ≈ 75 ч/га',
    more_information: 'Плотность застройки в сельских поселениях была низкой и определялась сельскохозяйственными потребностями.\n\nплотность населения ≈ 75 ч/га\nплотность застройки ≈ 10 усадеб/га\nколичество жильцов в усадьбе ≈ 8 ч/ус',
    app_flag: true,
    building_density: 10,
    people_per_building: 8
  }
];

export default MOCK_POPULATIONS;