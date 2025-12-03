import React from 'react';

interface ImageDebuggerProps {
  images: Array<{
    src: string;
    alt: string;
    status: 'loading' | 'loaded' | 'error';
  }>;
}

const ImageDebugger: React.FC<ImageDebuggerProps> = ({ images }) => {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Отладка изображений</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {images.map((img, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: img.status === 'loaded' ? 'green' : img.status === 'error' ? 'red' : 'yellow',
                marginRight: '5px'
              }} />
              <span style={{ 
                textOverflow: 'ellipsis', 
                overflow: 'hidden', 
                whiteSpace: 'nowrap',
                maxWidth: '250px'
              }}>
                {img.alt}: {img.src}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageDebugger;