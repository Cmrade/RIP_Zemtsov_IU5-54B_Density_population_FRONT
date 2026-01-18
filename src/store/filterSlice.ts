import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  searchTerm: string;
}

const initialState: FilterState = {
  searchTerm: '',
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    clearSearchTerm: (state) => {
      state.searchTerm = '';
    },
  },
});

export const { setSearchTerm, clearSearchTerm } = filterSlice.actions;
export default filterSlice.reducer;