import React, { useState, useEffect } from 'react';
import { Population } from '../types';
import { useNavigate } from 'react-router-dom';
import { MEDIA_BASE_URL } from '../services/axiosInstance';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/cartSlice';
import { Button, Spinner, Alert } from 'react-bootstrap';

interface PopulationCardProps {
  population: Population;
}

const PopulationCard: React.FC<PopulationCardProps> = ({ population }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentApplication, loading } = useAppSelector((state) => state.cart);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string>('');

  useEffect(() => {
    if (population.image) {
      if (population.image.startsWith('http')) {
        setImageSrc(population.image);
      } else if (population.image.startsWith('/media/')) {
        setImageSrc(`${MEDIA_BASE_URL}${population.image.substring(6)}`);
      } else if (population.image.startsWith('media/')) {
        setImageSrc(`${MEDIA_BASE_URL}/${population.image}`);
      } else {
        setImageSrc(population.image);
      }
    } else {
      setImageSrc('/default-image.jpg');
    }
  }, [population.image]);

  const handleImageError = () => {
    setImageError(true);
    setImageSrc('/default-image.jpg');
  };

  const handleDetailsClick = () => {
    navigate(`/populations/${population.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setAddError('');
    try {
      const applicationId = currentApplication?.id;
      await dispatch(addToCart({ 
        orderId: population.id,
        applicationId,
        comment: `Добавлено: ${new Date().toLocaleString()}`
      })).unwrap();
      
      alert(`Услуга "${population.title}" добавлена в заявку!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setAddError(error.message || 'Ошибка добавления в заявку');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div 
      className="population-card-custom"
      onClick={handleDetailsClick}
      style={{ cursor: 'pointer' }}
    >
      <div id="rect"></div>
      <img 
        className="population-card-img"
        src={imageError ? '/default-image.jpg' : imageSrc}
        alt={population.title}
        onError={handleImageError}
        loading="lazy"
      />
      <div className="population-flag">услуга</div>
      <div className="population-card-title">{population.title}</div>
      <div className="population-card-info">{population.main_information}</div>
      
      <Button
        variant="primary"
        size="lg"
        onClick={handleAddToCart}
        disabled={adding || loading}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgb(187, 65, 15)',
          border: 'none',
          borderRadius: '15px',
          padding: '10px 20px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 10,
        }}
      >
        {adding ? (
          <>
            <Spinner animation="border" size="sm" /> Добавление...
          </>
        ) : (
          'Добавить в заявку'
        )}
      </Button>

      {addError && (
        <Alert 
          variant="danger" 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
            maxWidth: '250px',
          }}
          dismissible
          onClose={() => setAddError('')}
        >
          {addError}
        </Alert>
      )}
    </div>
  );
};

export default PopulationCard;