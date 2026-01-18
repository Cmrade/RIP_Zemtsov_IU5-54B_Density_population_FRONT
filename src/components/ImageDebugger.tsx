import React from 'react';
import { Image } from 'react-bootstrap';

interface ImageDebuggerProps {
  imageUrl: string;
}

const ImageDebugger: React.FC<ImageDebuggerProps> = ({ imageUrl }) => {
  // Замените process.env на import.meta.env
  if (import.meta.env.PROD) return null;  // или import.meta.env.MODE === 'production'

  return (
    <div style={{ marginTop: '10px', padding: '10px', border: '1px solid red' }}>
      <h5>Отладка изображения:</h5>
      <p>URL: {imageUrl}</p>
      <Image src={imageUrl} thumbnail style={{ maxWidth: '200px' }} />
    </div>
  );
};

export default ImageDebugger;