import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import FilterComponent from '../components/FilterComponent';
import PopulationCard from '../components/PopulationCard';
import { Population } from '../types';
import { apiService } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { setSearchTerm } from '../store/filterSlice';

const PopulationsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [populations, setPopulations] = useState<Population[]>([]);
  const [filteredPopulations, setFilteredPopulations] = useState<Population[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopulations = async () => {
      try {
        const populationsData = await apiService.getPopulations();
        setPopulations(populationsData);
        setFilteredPopulations(populationsData);
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopulations();
  }, []);

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term));
    
    if (term.trim() === '') {
      setFilteredPopulations(populations);
    } else {
      const filtered = populations.filter(population =>
        population.title.toLowerCase().includes(term.toLowerCase()) ||
        population.main_information.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPopulations(filtered);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка услуг...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4 text-center text-md-start">Этнографические данные</h1>
      
      <div className="mb-4">
        <FilterComponent onSearchChange={handleSearch} />
      </div>
      
      <div className='cards'>
        {filteredPopulations.length > 0 ? (
          filteredPopulations.map(population => (
            <PopulationCard key={population.id} population={population} />
          ))
        ) : (
          <div className="text-center py-5">
            <h3>Услуги не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default PopulationsList;