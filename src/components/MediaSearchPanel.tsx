import React from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { MediaFile } from '../types';

interface MediaSearchPanelProps {
  mediaFiles: MediaFile[];
  onSearchByMedia: (imageUrl: string) => void;
  loading?: boolean;
}

const MediaSearchPanel: React.FC<MediaSearchPanelProps> = ({ 
  mediaFiles, 
  onSearchByMedia,
  loading = false 
}) => {
  // Фильтруем только изображения
  const imageMedia = mediaFiles.filter(media => 
    media.file_type === 'image' || 
    media.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  if (imageMedia.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <p className="text-muted mb-0">Нет доступных изображений для поиска</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5>🖼️ Поиск по изображениям из базы</h5>
        <p className="text-muted mb-3">
          Нажмите на изображение, чтобы найти похожие типы населения
        </p>
        
        <Row>
          {imageMedia.slice(0, 6).map((media) => (
            <Col xs={6} md={4} lg={2} key={media.id} className="mb-3">
              <div 
                className="position-relative"
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                onClick={() => !loading && onSearchByMedia(media.file_url)}
              >
                <img
                  src={media.file_url}
                  alt="Изображение из базы"
                  className="img-fluid rounded"
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    opacity: loading ? 0.6 : 1,
                    transition: 'opacity 0.3s'
                  }}
                />
                {loading && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Загрузка...</span>
                    </div>
                  </div>
                )}
                <Badge 
                  bg="secondary" 
                  className="position-absolute top-0 end-0 mt-1 me-1"
                  style={{ fontSize: '0.6rem' }}
                >
                  #{media.id}
                </Badge>
              </div>
            </Col>
          ))}
        </Row>
        
        {imageMedia.length > 6 && (
          <div className="text-center mt-2">
            <small className="text-muted">
              и еще {imageMedia.length - 6} изображений...
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MediaSearchPanel;