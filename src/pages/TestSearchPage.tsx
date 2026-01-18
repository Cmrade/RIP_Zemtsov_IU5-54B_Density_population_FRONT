import React, { useState, useRef } from 'react';
import { Container, Button, ProgressBar, Alert, Card, Row, Col, Badge } from 'react-bootstrap';
import { Population } from '../types';
import { useSimpleSearch } from '../hooks/useSimpleSearch';

// Тестовые данные
const TEST_POPULATIONS: Population[] = [
  {
    id: 1,
    title: 'Древний город',
    main_information: 'плотность ≈ 110 ч/га',
    image: 'http://localhost:9000/static/img/town.png',
    more_information: 'Древний город описание',
    building_density: 17,
    people_per_building: 6
  },
  {
    id: 2,
    title: 'Крепость',
    main_information: 'плотность ≈ 135 ч/га',
    image: 'http://localhost:9000/static/img/tower.png',
    more_information: 'Крепость описание',
    building_density: 25,
    people_per_building: 5
  },
  {
    id: 3,
    title: 'Село',
    main_information: 'плотность ≈ 75 ч/га',
    image: 'http://localhost:9000/static/img/village.png',
    more_information: 'Село описание',
    building_density: 10,
    people_per_building: 8
  },
  {
    id: 7,
    title: 'Крупный город',
    main_information: 'плотность ≈ 150 ч/га',
    image: 'http://localhost:9000/static/img/city.png',
    more_information: 'Крупный город описание',
    building_density: undefined,
    people_per_building: undefined
  }
];

const TestSearchPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    items,
    ready,
    progress,
    progressMessage,
    error,
    searchByImage,
    resetSearch
  } = useSimpleSearch(TEST_POPULATIONS);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(file);
    }
  };

  const handleClear = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSimilarityColor = (score: number) => {
    if (score > 0.7) return 'success';
    if (score > 0.4) return 'warning';
    return 'danger';
  };

  return (
    <Container>
      <h1 className="my-4">🧪 Тест AI Поиска</h1>
      
      <Alert variant="info">
        <p>
          <strong>Эта страница использует inline воркер для тестирования логики AI поиска.</strong>
        </p>
        <p className="mb-0">
          Загрузите изображение с названием, содержащим ключевые слова для получения разных результатов:
          "деревня", "город", "крепость". Для других изображений будет случайный результат.
        </p>
      </Alert>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => {}}>
          <strong>Ошибка:</strong> {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <h4>Загрузите тестовое изображение</h4>
          
          <Row className="align-items-center">
            <Col md={4}>
              <div className="text-center mb-3">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Загруженное" 
                    style={{ 
                      width: '200px', 
                      height: '150px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <div 
                    style={{ 
                      width: '200px', 
                      height: '150px', 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #dee2e6',
                      margin: '0 auto'
                    }}
                  >
                    <span className="text-muted">Нет изображения</span>
                  </div>
                )}
              </div>
            </Col>
            
            <Col md={8}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!ready}
                >
                  {ready ? '📁 Загрузить изображение' : `⏳ ${progressMessage}`}
                </Button>
                
                {selectedImage && (
                  <Button variant="outline-danger" onClick={handleClear}>
                    ❌ Сбросить поиск
                  </Button>
                )}
              </div>
              
              {!ready && (
                <div className="mb-3">
                  <ProgressBar now={progress} label={`${progress}%`} animated />
                  <small className="text-muted d-block mt-1">{progressMessage}</small>
                </div>
              )}
              
              {ready && !selectedImage && (
                <Alert variant="success" className="mb-0">
                  <small>✅ Система готова к поиску. Загрузите изображение.</small>
                </Alert>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h3 className="mb-3">
        Результаты поиска: {items.filter(i => i.isVisible).length} из {items.length}
        {items.some(i => i.score > 0) && (
          <Badge bg="info" className="ms-2">
            Сортировка по сходству
          </Badge>
        )}
      </h3>
      
      <div className="cards" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {items.map(population => (
          <Card 
            key={population.id} 
            style={{ 
              opacity: population.isVisible ? 1 : 0.6,
              cursor: 'pointer',
              borderColor: population.score > 0 ? '#0d6efd' : undefined
            }}
            onClick={() => console.log('Выбрано:', population.title, 'сходство:', population.score)}
          >
            <Card.Img 
              variant="top" 
              src={population.image || '/default-image.jpg'} 
              style={{ height: '200px', objectFit: 'cover' }}
            />
            
            <Card.Body>
              <Card.Title>{population.title}</Card.Title>
              <Card.Text>{population.main_information}</Card.Text>
              
              {population.score !== undefined && population.score > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Сходство:</span>
                    <Badge bg={getSimilarityColor(population.score)}>
                      {(population.score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <ProgressBar 
                    now={population.score * 100} 
                    variant={getSimilarityColor(population.score)}
                    className="mt-2"
                  />
                </div>
              )}
              
              {population.score === 0 && (
                <div className="mt-3 text-center text-muted">
                  <small>Нет данных о сходстве</small>
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-top">
        <h5>Отладочная информация:</h5>
        <Alert variant="secondary">
          <pre style={{ 
            margin: 0,
            fontSize: '12px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {JSON.stringify({
              ready,
              progress,
              progressMessage,
              itemsCount: items.length,
              items: items.map(item => ({
                id: item.id,
                title: item.title,
                score: item.score,
                isVisible: item.isVisible,
                hasEmbedding: !!item.embedding
              }))
            }, null, 2)}
          </pre>
        </Alert>
      </div>
    </Container>
  );
};

export default TestSearchPage;