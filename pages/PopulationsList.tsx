import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FilterComponent from '../components/FilterComponent';
import PopulationCard from '../components/PopulationCard';
import { Population } from '../types';
import { apiService } from '../services/api';
import { useAppSelector } from '../hooks/useAppSelector';

const PopulationsList: React.FC = () => {
  const [populations, setPopulations] = useState<Population[]>([]);
  const [filteredPopulations, setFilteredPopulations] = useState<Population[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Получаем searchTerm из Redux store
  const searchTerm = useAppSelector((state) => state.filters.searchTerm);

  useEffect(() => {
    const loadPopulations = async () => {
      try {
        const populationsData = await apiService.getPopulations();
        setPopulations(populationsData);
        // Применяем текущий фильтр при загрузке
        applyFilter(searchTerm, populationsData);
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopulations();
  }, []);

  useEffect(() => {
    applyFilter(searchTerm, populations);
  }, [searchTerm, populations]);

  const applyFilter = async (term: string, data: Population[]) => {
    if (term.trim() === '') {
      setFilteredPopulations(data);
    } else {
      try {
        const searchedPopulations = await apiService.searchPopulations(term);
        setFilteredPopulations(searchedPopulations);
      } catch (error) {
        console.error('Ошибка поиска:', error);
        // Фильтрация локально как fallback
        const filtered = data.filter(population =>
          population.title.toLowerCase().includes(term.toLowerCase()) ||
          population.main_information.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredPopulations(filtered);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-5">Загрузка...</div>;
  }

  return (
    <Container>
      <h1 className="my-4">Этнографические данные</h1>
      
      {/* FilterComponent теперь использует Redux самостоятельно */}
      <FilterComponent />
      
      <Row className='cards'>
        {filteredPopulations.length > 0 ? (
          filteredPopulations.map(population => (
            <Col key={population.id} md={6} lg={4} className="mb-4">
              <PopulationCard population={population} />
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center py-4">
              <h3>Услуги не найдены</h3>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default PopulationsList;