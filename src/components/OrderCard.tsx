import React, { useState } from 'react';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleDetailsClick = () => {
    navigate(`/orders/${order.id}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const imageSrc = imageError ? '/default-image.jpg' : (order.image || '/default-image.jpg');

  return (
    <div 
      className="order-card-custom"
      onClick={handleDetailsClick}
      style={{ cursor: 'pointer' }}
    >
      <div id="rect"></div>
      <img 
        className="order-card-img"
        src={imageSrc}
        alt={order.title}
        onError={handleImageError}
      />
      <div className="order-flag">услуга</div>
      <div className="order-card-title">{order.title}</div>
      <div className="order-card-info">{order.main_information}</div>
    </div>
  );
};

export default OrderCard;