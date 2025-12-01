import React, { useState } from 'react';
import { Population } from '../types';
import { useNavigate } from 'react-router-dom';

interface PopulationCardProps {
  population: Population;
}

const PopulationCard: React.FC<PopulationCardProps> = ({ population }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleDetailsClick = () => {
    navigate(`/populations/${population.id}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const imageSrc = imageError ? '/default-image.jpg' : (population.image || '/default-image.jpg');

  return (
    <div 
      className="population-card-custom"
      onClick={handleDetailsClick}
      style={{ cursor: 'pointer' }}
    >
      <div id="rect"></div>
      <img 
        className="population-card-img"
        src={imageSrc}
        alt={population.title}
        onError={handleImageError}
      />
      <div className="population-flag">услуга</div>
      <div className="population-card-title">{population.title}</div>
      <div className="population-card-info">{population.main_information}</div>
    </div>
  );
};

export default PopulationCard;