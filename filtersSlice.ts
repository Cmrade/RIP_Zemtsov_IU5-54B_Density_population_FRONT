import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FiltersState } from '../../types';

const initialState: FiltersState = {
  searchTerm: '',
  serviceType: 'all',
  sortBy: 'default',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setServiceType: (state, action: PayloadAction<string>) => {
      state.serviceType = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.searchTerm = '';
      state.serviceType = 'all';
      state.sortBy = 'default';
    },
  },
});

export const { setSearchTerm, setServiceType, setSortBy, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;