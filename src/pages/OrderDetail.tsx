import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { Order } from '../types';
import { apiService } from '../services/api';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await apiService.getOrderById(parseInt(id));
        setOrder(data);
        setError('');
      } catch (err) {
        setError('Ошибка при загрузке данных услуги');
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
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

  if (!order) {
    return (
      <Container>
        <Alert variant="danger">Услуга не найдена</Alert>
        <Button onClick={() => navigate('/orders')}>Вернуться к списку</Button>
      </Container>
    );
  }

  const imageSrc = imageError ? '/default-image.jpg' : (order.image || '/default-image.jpg');

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
          alt={order.title}
          onError={handleImageError}
        />
        <div className="detail-card-title">{order.title}</div>
        <div className="detail-card-info">
          {order.more_information}
        </div>
        
        {order.building_density && order.people_per_building && (
          <div className="detail-card-calculation">
            <p><strong>Плотность застройки:</strong> {order.building_density} домов/га</p>
            <p><strong>Количество человек в постройке:</strong> {order.people_per_building} чел/дом</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default OrderDetail;