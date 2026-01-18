import { useState, useRef, useEffect } from 'react';
import { Population } from '../types';
import { cosineSimilarity } from '../utils/math';

export interface ProcessedPopulation extends Population {
    embedding?: number[];
    score: number;
    isVisible: boolean;
}

// Inline воркер в виде строки
const createInlineWorker = () => {
    const workerCode = `
        self.addEventListener('message', async (event) => {
            const { type, data } = event.data;
            
            console.log('📨 Inline Worker получил сообщение:', type);

            try {
                if (type === 'init') {
                    console.log('Инициализация с данными:', data.length, 'элементов');
                    
                    // Симуляция загрузки
                    for (let i = 0; i <= 100; i += 10) {
                        self.postMessage({ 
                            type: 'progress', 
                            data: { status: 'progress', progress: i } 
                        });
                        await new Promise(resolve => setTimeout(resolve, 30));
                    }
                    
                    // Создаем фиктивные эмбеддинги
                    const embeddings = {};
                    
                    data.forEach((item) => {
                        // Создаем детерминированные эмбеддинги на основе ID
                        const embedding = new Array(512).fill(0);
                        
                        // Для древнего города (id=1)
                        if (item.id === 1) {
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.sin(i * 0.1) * 0.5 + 0.3;
                            }
                        }
                        // Для крепости (id=2)
                        else if (item.id === 2) {
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.cos(i * 0.15) * 0.5 + 0.2;
                            }
                        }
                        // Для села (id=3)
                        else if (item.id === 3) {
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.sin(i * 0.05) * 0.3 + 0.1;
                            }
                        }
                        // Для крупного города (id=7)
                        else if (item.id === 7) {
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.cos(i * 0.12) * 0.4 + 0.25;
                            }
                        }
                        // Остальные
                        else {
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.random() * 0.1;
                            }
                        }
                        
                        embeddings[item.id] = embedding;
                    });
                    
                    console.log('Созданы фиктивные эмбеддинги');
                    
                    self.postMessage({ 
                        type: 'text_embeddings_ready', 
                        data: embeddings 
                    });
                }
                
                if (type === 'image') {
                    console.log('Обработка изображения:', data.name);
                    
                    // Создаем фиктивный эмбеддинг для изображения
                    const imageEmbedding = new Array(512).fill(0);
                    const fileName = data.name.toLowerCase();
                    
                    // Простая логика для теста
                    if (fileName.includes('деревня') || fileName.includes('village') || fileName.includes('село')) {
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.sin(i * 0.05) * 0.3 + 0.15;
                        }
                    } else if (fileName.includes('город') || fileName.includes('city')) {
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.sin(i * 0.1) * 0.5 + 0.35;
                        }
                    } else if (fileName.includes('крепость') || fileName.includes('fortress')) {
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.cos(i * 0.15) * 0.5 + 0.25;
                        }
                    } else {
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.random() * 0.2;
                        }
                    }
                    
                    self.postMessage({ 
                        type: 'image_embedding_ready', 
                        data: imageEmbedding 
                    });
                }
                
            } catch (error) {
                console.error('Ошибка в воркере:', error);
                self.postMessage({ 
                    type: 'error', 
                    data: error instanceof Error ? error.message : String(error) 
                });
            }
        });
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
};

export const useSimpleSearch = (initialItems: Population[]) => { 
    const [items, setItems] = useState<ProcessedPopulation[]>(
        initialItems.map(item => ({ 
            ...item, 
            score: 0, 
            isVisible: true 
        }))
    );
    
    const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('Готовится поиск...');
    const [error, setError] = useState<string | null>(null);
    
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        console.log('🔄 Инициализация упрощенного поиска');
        
        try {
            // Создаем inline воркер
            workerRef.current = createInlineWorker();
            
            workerRef.current.onmessage = (e) => {
                const { type, data } = e.data;
                console.log('📨 Получено сообщение:', type);

                switch (type) {
                    case 'progress':
                        setProgress(data.progress);
                        setProgressMessage(`Загрузка модели: ${data.progress}%`);
                        if (data.progress === 100) {
                            setReady(true);
                        }
                        break;
                    
                    case 'text_embeddings_ready':
                        console.log('✅ Текстовые эмбеддинги готовы');
                        
                        setItems(prev => prev.map(item => ({
                            ...item,
                            embedding: data[item.id] || new Array(512).fill(0.1)
                        })));
                        setReady(true);
                        setProgress(100);
                        setProgressMessage('Поиск готов к работе');
                        break;

                    case 'image_embedding_ready':
                        console.log('🖼️ Получен эмбеддинг изображения');
                        setImageEmbedding(data);
                        break;
                    
                    case 'error':
                        console.error('❌ Ошибка:', data);
                        setError(data);
                        setReady(true);
                        break;
                }
            };

            workerRef.current.onerror = (e) => {
                console.error('❌ Ошибка воркера:', e);
                setError('Ошибка в воркере');
                setReady(true);
            };

        } catch (error) {
            console.error('❌ Не удалось создать воркер:', error);
            setError('Не удалось создать воркер');
            setReady(true);
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [initialItems]);

    useEffect(() => {
        // Инициализация воркера
        if (workerRef.current && initialItems.length > 0) {
            const itemsForWorker = initialItems.map(item => ({
                id: item.id,
                title: item.title,
                description: item.main_information
            }));
            
            console.log('📤 Отправка данных в воркер:', itemsForWorker.length);
            
            setTimeout(() => {
                if (workerRef.current) {
                    workerRef.current.postMessage({ 
                        type: 'init', 
                        data: itemsForWorker 
                    });
                }
            }, 100);
        }
    }, [initialItems]);

    useEffect(() => {
        if (!imageEmbedding) {
            console.log('🖼️ Нет эмбеддинга изображения');
            return;
        }

        console.log('🔍 Начинаем поиск по изображению');
        console.log('Размер эмбеддинга изображения:', imageEmbedding.length);
        
        setItems(prevItems => {
            const processed = prevItems.map(item => {
                if (!item.embedding) {
                    console.log(`⚠️ Нет эмбеддинга для ${item.title}`);
                    return { ...item, score: 0, isVisible: true };
                }
                
                console.log(`📏 Размер эмбеддинга ${item.title}: ${item.embedding.length}`);
                
                const similarity = cosineSimilarity(imageEmbedding, item.embedding);
                console.log(`📈 "${item.title}": ${(similarity * 100).toFixed(1)}%`);
                
                // Показывать все элементы для отладки
                return {
                    ...item,
                    score: similarity,
                    isVisible: true
                };
            });

            // Сортируем по сходству
            processed.sort((a, b) => b.score - a.score);
            
            // Логируем результаты
            console.log('🏆 Результаты сортировки:');
            processed.forEach((item, index) => {
                console.log(`${index + 1}. "${item.title}" - ${(item.score * 100).toFixed(1)}%`);
            });
            
            return processed;
        });

    }, [imageEmbedding]);

    const searchByImage = (file: File) => {
        console.log('📤 Поиск по изображению:', file.name);
        
        if (!workerRef.current) {
            console.error('Воркер не инициализирован');
            alert('Поиск еще не готов');
            return;
        }
        
        if (!ready) {
            console.error('Модель не готова');
            alert('Модель все еще загружается');
            return;
        }

        try {
            workerRef.current.postMessage({ type: 'image', data: file });
            setProgressMessage('Анализ изображения...');
        } catch (error) {
            console.error('Ошибка отправки изображения:', error);
            alert('Ошибка обработки изображения');
        }
    };

    const resetSearch = () => {
        console.log('🔄 Сброс поиска');
        setImageEmbedding(null);
        setError(null);
        setProgressMessage('Готов к поиску');
        setItems(prev => {
            const sortedById = [...prev].sort((a, b) => a.id - b.id);
            return sortedById.map(item => ({
                ...item,
                score: 0,
                isVisible: true
            }));
        });
    };

    return {
        items,
        ready,
        progress,
        progressMessage,
        imageEmbedding,
        error,
        searchByImage,
        resetSearch
    };
};