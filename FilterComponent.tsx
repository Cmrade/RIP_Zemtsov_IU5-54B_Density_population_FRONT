import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSearchTerm, clearSearchTerm } from '../store/filterSlice';

interface FilterComponentProps {
  onSearchChange: (term: string) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ 
  onSearchChange 
}) => {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.filter.searchTerm);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchTerm);
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    dispatch(clearSearchTerm());
    onSearchChange('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    dispatch(setSearchTerm(value));
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Поиск услуг по названию или описанию"
          value={localSearchTerm}
          onChange={handleInputChange}
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