import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { Population } from '../types';
import { apiService } from '../services/api';

const PopulationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [population, setPopulation] = useState<Population | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadPopulation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await apiService.getPopulationById(parseInt(id));
        setPopulation(data);
        setError('');
      } catch (err) {
        setError('Ошибка при загрузке данных услуги');
        console.error('Error loading population:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPopulation();
  }, [id]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">Загрузка...</div>
      </Container>
    );
  }

  if (!population) {
    return (
      <Container>
        <Alert variant="danger">Услуга не найдена</Alert>
        <Button onClick={() => navigate('/populations')}>Вернуться к списку</Button>
      </Container>
    );
  }

  const imageSrc = imageError ? '/default-image.jpg' : (population.image || '/default-image.jpg');

  return (
    <Container>
      {error && (
        <Alert variant="warning">
          {error} - используются демонстрационные данные
        </Alert>
      )}

      <div className="detail-page-title">Этнографические данные</div>

      <div className="detail-card">
        <img 
          className="detail-card-img"
          src={imageSrc}
          alt={population.title}
          onError={handleImageError}
        />
        <div className="detail-card-title">{population.title}</div>
        <div className="detail-card-info">
          {population.more_information}
        </div>
        
        {population.building_density && population.people_per_building && (
          <div className="detail-card-calculation">
            <p><strong>Плотность застройки:</strong> {population.building_density} домов/га</p>
            <p><strong>Количество человек в постройке:</strong> {population.people_per_building} чел/дом</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default PopulationDetail;