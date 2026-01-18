import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, ProgressBar, Alert, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FilterComponent from '../components/FilterComponent';
import PopulationCard from '../components/PopulationCard';
import { Population, PopulationWithScore } from '../types'; // Добавляем импорт
import { apiService } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSearchTerm } from '../store/filterSlice';
import { useMultimodalSearch } from '../hooks/useMultimodalSearch';

const PopulationsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [populations, setPopulations] = useState<Population[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Используем обновленный AI поиск
  const {
    ready: modelReady,
    progress: modelProgress,
    progressMessage,
    error: aiError,
    searchByImage,
    resetSearch,
    searchResults
  } = useMultimodalSearch(populations);

  const searchTerm = useAppSelector((state) => state.filter.searchTerm);
  const [filteredPopulations, setFilteredPopulations] = useState<Population[]>([]);
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');

  useEffect(() => {
    const loadPopulations = async () => {
      try {
        console.log('🔄 Загрузка типов населения...');
        const populationsData = await apiService.getPopulations();
        console.log('✅ Типы населения загружены:', populationsData.length);
        
        setPopulations(populationsData);
        setFilteredPopulations(populationsData);
      } catch (error) {
        console.error('Ошибка загрузки типов населения:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopulations();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPopulations(populations);
    } else {
      const filtered = populations.filter(population =>
        population.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        population.main_information.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPopulations(filtered);
    }
  }, [searchTerm, populations]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSearchMode('image');
      searchByImage(file);
    }
  };

  const handleClearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    resetSearch();
    setSearchMode('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Получаем отображаемые популяции в зависимости от режима поиска
  const getDisplayPopulations = (): PopulationWithScore[] => {
    if (searchMode === 'text') {
      return filteredPopulations.map(pop => ({
        ...pop,
        score: 0,
        isVisible: true
      }));
    } else {
      // AI поиск: фильтруем и сортируем по результатам поиска
      const resultsMap = new Map(searchResults.map(result => [result.id, result]));
      
      return populations
        .map(population => {
          const result = resultsMap.get(population.id);
          return {
            ...population,
            score: result?.score || 0,
            isVisible: result ? result.isVisible : false
          };
        })
        .filter(population => population.isVisible)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  };

  const displayPopulations = getDisplayPopulations();

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка типов населения...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4 text-center text-md-start">Этнографические данные</h1>
      
      {!isAuthenticated && (
        <Alert variant="info" className="mb-4">
          <p className="mb-0">
            Для добавления типов населения в расчет плотности необходимо{' '}
            <a href="/login" className="alert-link">войти в систему</a> или{' '}
            <a href="/register" className="alert-link">зарегистрироваться</a>.
          </p>
        </Alert>
      )}
      
      {aiError && (
        <Alert variant="danger" className="mb-4">
          <p className="mb-0">Ошибка AI поиска: {aiError}</p>
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <FilterComponent onSearchChange={(term) => dispatch(setSearchTerm(term))} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h4>🤖 AI Поиск по изображению</h4>
          <p className="text-muted">
            Загрузите изображение археологического объекта или поселения, чтобы найти похожие типы населения с помощью искусственного интеллекта
          </p>
          
          <Row className="align-items-center">
            <Col md={4}>
              <div className="text-center mb-3 mb-md-0">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Загруженное изображение" 
                    style={{ 
                      width: '100%', 
                      maxWidth: '200px', 
                      height: '150px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <div 
                    style={{ 
                      width: '100%', 
                      maxWidth: '200px', 
                      height: '150px', 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #dee2e6'
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
                  disabled={!modelReady}
                >
                  {modelReady ? '📁 Загрузить изображение для AI анализа' : `⏳ ${progressMessage}`}
                </Button>
                
                {selectedImage && (
                  <Button variant="outline-danger" onClick={handleClearImage}>
                    ❌ Сбросить AI поиск
                  </Button>
                )}
              </div>
              
              {!modelReady && (
                <div className="mb-3">
                  <ProgressBar now={modelProgress} label={`${Math.round(modelProgress)}%`} animated />
                  <small className="text-muted d-block mt-1">
                    {progressMessage || 'Инициализация AI модели...'}
                  </small>
                </div>
              )}
              
              {modelReady && !selectedImage && (
                <Alert variant="success" className="mb-0">
                  <small>✅ AI модель готова к анализу изображений</small>
                </Alert>
              )}
              
              {searchMode === 'image' && (
                <Alert variant="info" className="mb-0 mt-2">
                  <small>
                    🤖 AI проанализировал изображение и нашёл {displayPopulations.length} подходящих типов населения.
                    {displayPopulations.length > 0 && ` Наиболее похожий: "${displayPopulations[0]?.title}" (${((displayPopulations[0]?.score || 0) * 100).toFixed(1)}% сходства)`}
                  </small>
                </Alert>
              )}
            </Col>
          </Row>
          
          {searchMode === 'image' && displayPopulations.length > 0 && (
            <div className="mt-3">
              <small className="text-muted">
                💡 <strong>Совет:</strong> Для лучших результатов назовите файл изображения соответствующим образом: 
                "деревня.jpg", "город.png", "крепость.jpg" и т.д.
              </small>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className='cards'>
        {displayPopulations.length > 0 ? (
          displayPopulations.map(population => (
            <PopulationCard 
              key={population.id} 
              population={population} // Теперь передаем PopulationWithScore
            />
          ))
        ) : (
          <div className="text-center py-5">
            <h3>Типы населения не найдены</h3>
            <p>
              {searchMode === 'image' 
                ? 'AI не смог найти подходящие типы населения. Попробуйте загрузить другое изображение или используйте текстовый поиск.'
                : 'Попробуйте изменить параметры поиска или используйте AI поиск по изображению.'}
            </p>
          </div>
        )}
      </div>
      
    </Container>
  );
};

export default PopulationsList;