import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setSearchTerm, resetFilters } from '../features/filters/filtersSlice';

interface FilterComponentProps {
  // Убираем props, так как теперь работаем с Redux
}

const FilterComponent: React.FC<FilterComponentProps> = () => {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.filters.searchTerm);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Обновляем локальное состояние при изменении в Redux
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        dispatch(setSearchTerm(localSearchTerm));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, dispatch, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchTerm(localSearchTerm));
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    dispatch(resetFilters());
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Поиск услуг по названию или описанию"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        {localSearchTerm && (
          <Button 
            variant="outline-secondary" 
            onClick={handleClear}
            title="Очистить поиск"
          >
            ×
          </Button>
        )}
        <Button variant="primary" type="submit">
          Найти
        </Button>
      </InputGroup>
      <Form.Text className="text-muted">
        {localSearchTerm && `Найдено услуг: поиск по "${localSearchTerm}"`}
      </Form.Text>
    </Form>
  );
};

export default FilterComponent;