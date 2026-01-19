import React, { useState, useEffect, useContext } from 'react'; // Добавляем useContext
import { PopulationWithScore } from '../types';
import { useNavigate } from 'react-router-dom';
import { MEDIA_BASE_URL } from '../services/axiosInstance';
import { useAppSelector } from '../store/hooks';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { CartContext } from '../contexts/CartContext'; // Импортируем контекст

interface PopulationCardProps {
  population: PopulationWithScore;
}

const getScoreColor = (score: number): string => {
  if (score > 0.7) return 'rgba(40, 167, 69, 0.9)';
  if (score > 0.4) return 'rgba(255, 193, 7, 0.9)';
  return 'rgba(0, 123, 255, 0.8)';
};

const PopulationCard: React.FC<PopulationCardProps> = ({ population }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const cartContext = useContext(CartContext);
  
  if (!cartContext) {
    throw new Error('CartContext must be used within CartProvider');
  }
  
  const { currentDensityCalculation, loading } = cartContext;
  const { getOrCreateDraftCalculation, addPopulationToDensityCalculation } = cartContext;
  
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
      let densityCalculationId = currentDensityCalculation?.id;
      
      if (!densityCalculationId) {
        try {
          const draftResult = await getOrCreateDraftCalculation();
          densityCalculationId = draftResult.density_calculation_id;
          
          if (!densityCalculationId) {
            throw new Error('Не удалось получить ID расчета плотности');
          }
          
          console.log('✅ Черновик расчета создан:', densityCalculationId);
        } catch (draftError: any) {
          console.error('Ошибка создания черновика:', draftError);
          setAddError('Не удалось создать расчет плотности. Попробуйте снова.');
          setAdding(false);
          return;
        }
      }
      
      await addPopulationToDensityCalculation(population.id, densityCalculationId, 
        `Добавлено: ${new Date().toLocaleString('ru-RU')}`);
      
      alert(`✅ Тип населения "${population.title}" добавлен в расчет плотности!`);
      
    } catch (error: any) {
      console.error('Error adding to density calculation:', error);
      
      const errorMessage = error?.message || error?.toString() || '';
      
      if (errorMessage.includes('уже добавлен') || errorMessage.includes('уже в корзине')) {
        setAddError('Этот тип населения уже есть в вашем расчете');
      } else if (errorMessage.includes('не авторизован') || errorMessage.includes('войти')) {
        setAddError('Для добавления типов населения нужно войти в систему');
        setTimeout(() => navigate('/login'), 1000);
      } else if (errorMessage.includes('не найдена') || errorMessage.includes('Не найден')) {
        setAddError('Расчет плотности не найден. Создайте новый расчет.');
      } else if (errorMessage.includes('Не удалось получить ID')) {
        setAddError('Не удалось создать расчет плотности. Попробуйте обновить страницу.');
      } else {
        setAddError('Ошибка добавления в расчет: ' + errorMessage);
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div 
      className="population-card-custom"
      onClick={handleDetailsClick}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {/* Основной AI бейдж сходства - в правом верхнем углу */}
      {population.score !== undefined && population.score > 0.1 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: getScoreColor(population.score),
          color: 'white',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 5,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>🤖</span>
          <span>{(population.score * 100).toFixed(0)}%</span>
        </div>
      )}
      
      {/* Второстепенный AI бейдж для низких значений сходства */}
      {population.score !== undefined && population.score > 0 && population.score <= 0.1 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(108, 117, 125, 0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 5
        }}>
          AI: {(population.score * 100).toFixed(0)}%
        </div>
      )}

      <div id="rect"></div>
      <img 
        className="population-card-img"
        src={imageError ? '/default-image.jpg' : imageSrc}
        alt={population.title}
        onError={handleImageError}
        loading="lazy"
      />
      <div className="population-flag">объект</div>
      
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
          'Добавить в расчет'
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