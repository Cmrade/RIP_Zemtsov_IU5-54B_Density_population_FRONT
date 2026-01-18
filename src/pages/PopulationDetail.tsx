// src/components/PopulationDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { Population } from '../types';
import { apiService } from '../services/api';
import MediaCarousel from '../components/MediaCarousel';

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
        setError('Ошибка при загрузке данных типа населения');
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
        <Alert variant="danger">Тип населения не найден</Alert>
        <Button onClick={() => navigate('/populations')}>Вернуться к списку</Button>
      </Container>
    );
  }

  // Если нет медиа-файлов, показываем одиночное изображение как раньше
  const hasMediaFiles = population.media_files && population.media_files.length > 0;

  return (
    <Container>
      {error && (
        <Alert variant="warning">
          {error} - используются демонстрационные данные
        </Alert>
      )}

      <div className="detail-page-title">Этнографические данные</div>

      <div className="detail-card">
        {/* Заменяем одиночное изображение на карусель */}
        <div className="detail-card-img" style={{ position: 'absolute', top: '0px', left: '0px' }}>
          {hasMediaFiles ? (
            <MediaCarousel 
              mediaFiles={population.media_files || []}
              populationTitle={population.title}
            />
          ) : (
            <img 
              src={population.image || '/default-image.jpg'}
              alt={population.title}
              style={{
                width: '500px',
                height: '402px',
                borderRadius: '48px',
                objectFit: 'cover'
              }}
              onError={handleImageError}
            />
          )}
        </div>
        
        <div className="detail-card-title">{population.title}</div>
        <div className="detail-card-info">
          {population.more_information}
        </div>
        
        {population.building_density && population.people_per_building && (
          <div style={{
            position: 'relative',
            left: '520px',
            top: '240px',
            color: 'black',
            fontFamily: "'Roboto-regular', Roboto, sans-serif",
            fontSize: '20px'
          }}>
          </div>
        )}
      </div>
    </Container>
  );
};

export default PopulationDetail;