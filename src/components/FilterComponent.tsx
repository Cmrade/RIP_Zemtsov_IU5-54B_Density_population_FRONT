import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

interface FilterComponentProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Обновляем локальное состояние при изменении пропса
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounce для поиска - отправляем запрос через 500ms после остановки ввода
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
    onSearchChange('');
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