// src/components/MediaCarousel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Carousel, Image } from 'react-bootstrap';
import { MediaFile } from '../types';
import { apiService } from '../services/api';

interface MediaCarouselProps {
  mediaFiles: MediaFile[];
  populationTitle: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ mediaFiles, populationTitle }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoErrors, setVideoErrors] = useState<{[key: number]: boolean}>({});
  const videoRefs = useRef<{[key: number]: HTMLVideoElement | null}>({});
  
  // Функция для исправления URL видео
  const getMediaUrl = (media: MediaFile): string => {
    return apiService.getMediaDirectUrl(media);
  };

  // Останавливаем все видео при смене слайда
  useEffect(() => {
    Object.keys(videoRefs.current).forEach(key => {
      const video = videoRefs.current[parseInt(key)];
      if (video && video.id !== `video-${activeIndex}`) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);

  // Автовоспроизведение активного видео
  useEffect(() => {
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo && mediaFiles[activeIndex]?.file_type === 'video') {
      const playPromise = activeVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Автовоспроизведение видео заблокировано:', error);
          // Показываем кнопку для ручного запуска
          const errorContainer = document.getElementById(`video-error-${activeIndex}`);
          if (errorContainer) {
            errorContainer.style.display = 'flex';
          }
        });
      }
    }
  }, [activeIndex, mediaFiles]);

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-info">
          Нет медиа-файлов для отображения
        </div>
      </div>
    );
  }

  // Сортируем медиа-файлы по ID (по умолчанию они уже должны быть отсортированы)
  const sortedMediaFiles = [...mediaFiles].sort((a, b) => a.id - b.id);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  const handleVideoEnded = () => {
    // При завершении видео автоматически переходим к следующему элементу
    const nextIndex = (activeIndex + 1) % sortedMediaFiles.length;
    setActiveIndex(nextIndex);
  };

  const handleVideoError = (mediaId: number) => {
    console.error(`Ошибка загрузки видео с ID ${mediaId}`);
    setVideoErrors(prev => ({ ...prev, [mediaId]: true }));
  };

  const handleVideoLoaded = (mediaId: number) => {
    console.log(`Медиа с ID ${mediaId} успешно загружено`);
    setVideoErrors(prev => ({ ...prev, [mediaId]: false }));
  };

  const handleManualPlay = (mediaId: number) => {
    const video = videoRefs.current[mediaId];
    if (video) {
      video.play().then(() => {
        const errorContainer = document.getElementById(`video-error-${mediaId}`);
        if (errorContainer) {
          errorContainer.style.display = 'none';
        }
      }).catch(error => {
        console.error('Ошибка ручного воспроизведения:', error);
      });
    }
  };

  // Стили для единообразного отображения
  const containerStyle: React.CSSProperties = {
    width: '500px',
    height: '402px',
    borderRadius: '48px',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  };

  const mediaContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  };

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: '#000',
  };

  const videoStyle: React.CSSProperties = {
    ...mediaStyle,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <Carousel 
        activeIndex={activeIndex} 
        onSelect={handleSelect}
        interval={null}
        indicators={sortedMediaFiles.length > 1}
        controls={sortedMediaFiles.length > 1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {sortedMediaFiles.map((media, index) => (
          <Carousel.Item key={media.id} style={{
            width: '100%',
            height: '100%',
          }}>
            <div style={mediaContainerStyle}>
              {media.file_type === 'image' ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  <Image
                    src={getMediaUrl(media)}
                    alt={`${populationTitle} - изображение ${index + 1}`}
                    style={mediaStyle}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-image.jpg';
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {videoErrors[media.id] ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      backgroundColor: '#333',
                      padding: '20px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                      <div style={{ fontSize: '16px', marginBottom: '10px' }}>Ошибка загрузки видео</div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={el => {
                          if (el) videoRefs.current[index] = el;
                        }}
                        id={`video-${index}`}
                        src={getMediaUrl(media)}
                        style={videoStyle}
                        autoPlay
                        muted
                        loop={false}
                        onEnded={handleVideoEnded}
                        onError={() => handleVideoError(media.id)}
                        onLoadedData={() => handleVideoLoaded(media.id)}
                        onCanPlay={() => handleVideoLoaded(media.id)}
                        playsInline
                        preload="auto"
                        onClick={() => {
                          // При клике на видео можно перезапустить его
                          const video = videoRefs.current[index];
                          if (video) {
                            video.currentTime = 0;
                            video.play();
                          }
                        }}
                      />
                      
                      {/* Сообщение об ошибке автовоспроизведения */}
                      <div 
                        id={`video-error-${index}`}
                        style={{
                          display: 'none',
                          position: 'absolute',
                          bottom: '20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '25px',
                          cursor: 'pointer',
                          zIndex: 10,
                          fontFamily: "'Roboto-regular', Roboto, sans-serif",
                          fontSize: '14px',
                        }}
                        onClick={() => handleManualPlay(index)}
                      >
                        ▶ Нажмите для воспроизведения видео
                      </div>
                      
                      {/* Индикатор, что это видео */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        fontFamily: "'Roboto-regular', Roboto, sans-serif",
                        zIndex: 5,
                      }}>
                        🎬 Видео
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {sortedMediaFiles.length > 1 && (
              <Carousel.Caption style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '5px',
                padding: '8px 15px',
                bottom: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'auto',
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontFamily: "'Roboto-regular', Roboto, sans-serif",
                }}>
                  {media.file_type === 'image' ? '📷 Изображение' : '🎬 Видео'} 
                  {` ${index + 1} из ${sortedMediaFiles.length}`}
                </span>
              </Carousel.Caption>
            )}
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default MediaCarousel;