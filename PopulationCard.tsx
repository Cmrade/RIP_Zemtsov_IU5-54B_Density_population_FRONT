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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', {
      src: e.currentTarget.src,
      population: population.title,
      error: 'Image load error'
    });
    setImageError(true);
  };

  // Проверяем путь к изображению
  const checkImagePath = (path: string) => {
    if (path.startsWith('http://localhost')) {
      console.warn(`Using localhost path: ${path}. This won't work on GitHub Pages.`);
    }
    return path;
  };

  const imageSrc = imageError ? '/default-image.jpg' : 
    (population.image ? checkImagePath(population.image) : '/default-image.jpg');

  console.log(`PopulationCard ${population.id}:`, {
    title: population.title,
    imageSrc,
    originalImage: population.image
  });

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
        loading="lazy"
      />
      <div className="population-flag">услуга</div>
      <div className="population-card-title">{population.title}</div>
      <div className="population-card-info">{population.main_information}</div>
    </div>
  );
};

export default PopulationCard;