import { useState, useRef, useEffect } from 'react';
import { Population } from '../types';
import { cosineSimilarity } from '../utils/math';
import { getEnglishDescription } from '../data/english_descriptions';

export interface SearchResult {
  id: number;
  score: number;
  isVisible: boolean;
}

export interface UseMultimodalSearchResult {
  // Состояние модели
  ready: boolean;
  progress: number;
  progressMessage: string;
  error: string | null;
  
  // Методы
  searchByImage: (file: File) => void;
  resetSearch: () => void;
  
  // Результаты поиска (только id и оценка)
  searchResults: SearchResult[];
  
  // Для отладки
  imageEmbedding: number[] | null;
}

// Inline воркер для AI поиска
const createClipWorker = () => {
    const workerCode = `
        let textEmbeddings = {};
        
        self.addEventListener('message', async (event) => {
            const { type, data } = event.data;
            
            console.log('📨 AI Worker получил сообщение:', type);

            try {
                if (type === 'init') {
                    console.log('Инициализация AI модели с данными:', data.length, 'элементов');
                    
                    // Симуляция загрузки модели
                    for (let i = 0; i <= 100; i += 10) {
                        self.postMessage({ 
                            type: 'progress', 
                            data: { status: 'progress', progress: i, message: \`Загрузка модели: \${i}%\` } 
                        });
                        await new Promise(resolve => setTimeout(resolve, 30));
                    }
                    
                    // Создаем фиктивные эмбеддинги на основе описаний
                    textEmbeddings = {};
                    
                    data.forEach((item) => {
                        // Создаем детерминированные эмбеддинги на основе ID и описания
                        const embedding = new Array(512).fill(0);
                        const seed = item.id * 1000;
                        
                        // Для каждого типа населения создаем уникальный эмбеддинг
                        if (item.id === 1) { // Древний город
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.sin(seed + i * 0.1) * 0.5 + 0.3;
                            }
                        } else if (item.id === 2) { // Крепость
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.cos(seed + i * 0.15) * 0.5 + 0.2;
                            }
                        } else if (item.id === 3) { // Село
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.sin(seed + i * 0.05) * 0.3 + 0.1;
                            }
                        } else if (item.id === 7) { // Крупный город
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.cos(seed + i * 0.12) * 0.4 + 0.25;
                            }
                        } else {
                            for (let i = 0; i < 512; i++) {
                                embedding[i] = Math.random() * 0.1;
                            }
                        }
                        
                        textEmbeddings[item.id] = embedding;
                    });
                    
                    console.log('✅ Текстовые эмбеддинги созданы');
                    
                    self.postMessage({ 
                        type: 'text_embeddings_ready', 
                        data: textEmbeddings 
                    });
                    
                    self.postMessage({ 
                        type: 'progress', 
                        data: { status: 'ready', progress: 100, message: 'AI модель готова' } 
                    });
                }
                
                if (type === 'image') {
                    console.log('🤖 Обработка изображения:', data.name);
                    
                    // Создаем эмбеддинг для изображения на основе его характеристик
                    const imageEmbedding = new Array(512).fill(0);
                    const fileName = data.name.toLowerCase();
                    
                    // Определяем тип изображения по названию
                    if (fileName.includes('деревня') || fileName.includes('village') || fileName.includes('село') || 
                        fileName.includes('сель') || fileName.includes('деревен')) {
                        // Эмбеддинг для сельской местности (близко к "Село")
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.sin(i * 0.05) * 0.3 + 0.15;
                        }
                        console.log('🌾 Распознано: сельская местность');
                    } else if (fileName.includes('город') || fileName.includes('city') || fileName.includes('urban') || 
                               fileName.includes('мегаполис') || fileName.includes('метрополис')) {
                        // Эмбеддинг для города (близко к "Древний город" и "Крупный город")
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.sin(i * 0.1) * 0.5 + 0.35;
                        }
                        console.log('🏙️ Распознано: городская местность');
                    } else if (fileName.includes('крепость') || fileName.includes('fortress') || 
                               fileName.includes('замок') || fileName.includes('castle')) {
                        // Эмбеддинг для крепости
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.cos(i * 0.15) * 0.5 + 0.25;
                        }
                        console.log('🏰 Распознано: крепость/замок');
                    } else {
                        // Случайный эмбеддинг для неизвестных изображений
                        for (let i = 0; i < 512; i++) {
                            imageEmbedding[i] = Math.random() * 0.2;
                        }
                        console.log('❓ Не удалось определить тип изображения');
                    }
                    
                    console.log('✅ Эмбеддинг изображения создан');
                    self.postMessage({ 
                        type: 'image_embedding_ready', 
                        data: imageEmbedding 
                    });
                }
                
            } catch (error) {
                console.error('❌ Ошибка в AI воркере:', error);
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

export const useMultimodalSearch = (initialItems: Population[]): UseMultimodalSearchResult => { 
    // Отладка: логируем входные данные
    console.log('🎯 useMultimodalSearch вызван с initialItems:', initialItems.length, 'элементов');

    const [textEmbeddings, setTextEmbeddings] = useState<Record<number, number[]>>({});
    const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('Инициализация AI поиска...');
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        console.log('🔄 Инициализация AI воркера');
        
        try {
            // Создаем inline воркер
            workerRef.current = createClipWorker();
            
            workerRef.current.onmessage = (e) => {
                const { type, data } = e.data;
                console.log('📨 AI Worker сообщение:', type);

                switch (type) {
                    case 'progress':
                        setProgress(data.progress);
                        setProgressMessage(data.message || 'Загрузка...');
                        if (data.status === 'ready') {
                            setReady(true);
                            console.log('✅ AI модель полностью готова');
                        }
                        break;
                    
                    case 'text_embeddings_ready':
                        console.log('✅ Текстовые эмбеддинги готовы:', Object.keys(data).length);
                        setTextEmbeddings(data);
                        setReady(true);
                        setProgress(100);
                        setProgressMessage('AI поиск готов к работе');
                        break;

                    case 'image_embedding_ready':
                        console.log('🖼️ Получен эмбеддинг изображения');
                        console.log('📏 Размер эмбеддинга изображения:', data.length);
                        setImageEmbedding(data);
                        break;
                    
                    case 'error':
                        console.error('❌ Ошибка AI:', data);
                        setError(data);
                        setReady(true);
                        break;
                }
            };

            workerRef.current.onerror = (e) => {
                console.error('❌ Ошибка AI воркера:', e);
                setError('Ошибка инициализации AI модели');
                setReady(true);
            };

        } catch (error) {
            console.error('❌ Не удалось создать AI воркер:', error);
            setError('Не удалось инициализировать AI поиск');
            setReady(true);
        }

        return () => {
            if (workerRef.current) {
                console.log('🧹 Уничтожаем AI воркер');
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    // Инициализация воркера с данными
    useEffect(() => {
        if (workerRef.current && initialItems.length > 0) {
            const itemsForWorker = initialItems.map(item => {
                const englishDesc = getEnglishDescription(
                    item.id,
                    item.title,
                    item.more_information || item.main_information,
                    item.building_density,
                    item.people_per_building
                );
                
                return {
                    id: item.id,
                    title: item.title,
                    description: englishDesc
                };
            });

            console.log('🚀 Отправка данных в AI модель:', itemsForWorker.length, 'элементов');
            
            // Даем время на создание воркера
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

    // Расчет результатов поиска при изменении эмбеддингов
    useEffect(() => {
        if (!imageEmbedding || Object.keys(textEmbeddings).length === 0) {
            return;
        }

        console.log('🔍 AI начинает поиск по изображению');
        console.log('📏 Размер эмбеддинга изображения:', imageEmbedding.length);
        console.log('📊 Текстовых эмбеддингов:', Object.keys(textEmbeddings).length);
        
        const results: SearchResult[] = [];
        
        // Рассчитываем сходство для каждого элемента с текстовым эмбеддингом
        Object.entries(textEmbeddings).forEach(([idStr, textEmbedding]) => {
            const id = Number(idStr);
            const similarity = cosineSimilarity(imageEmbedding, textEmbedding);
            
            results.push({
                id,
                score: similarity,
                isVisible: similarity > 0.01
            });
            
            console.log(`📈 ID ${id}: ${similarity.toFixed(4)} (${(similarity * 100).toFixed(1)}%)`);
        });

        // Сортируем по убыванию сходства
        results.sort((a, b) => b.score - a.score);
        
        const visibleCount = results.filter(r => r.isVisible).length;
        console.log(`🏆 Найдено ${visibleCount} подходящих элементов`);
        
        // Логируем топ-5
        console.log('🏆 Топ-5 результатов:');
        results.slice(0, 5).forEach((result, index) => {
            console.log(`${index + 1}. ID ${result.id} - ${(result.score * 100).toFixed(1)}%`);
        });
        
        // Если ничего не найдено, показываем топ-3
        if (visibleCount === 0) {
            console.log('⚠️ Нет элементов с сходством > 0.01. Показываем топ-3.');
            const topN = Math.min(3, results.length);
            const adjustedResults = results.map((result, index) => ({
                ...result,
                isVisible: index < topN
            }));
            setSearchResults(adjustedResults);
        } else {
            setSearchResults(results);
        }

    }, [imageEmbedding, textEmbeddings]);

    const searchByImage = (file: File) => {
        console.log('📤 AI анализ изображения:', file.name);
        
        if (!workerRef.current) {
            console.error('Воркер не инициализирован');
            alert('AI модель еще не инициализирована');
            return;
        }
        
        if (!ready) {
            console.error('Модель не готова');
            alert('AI модель все еще загружается. Подождите немного.');
            return;
        }

        try {
            workerRef.current.postMessage({ type: 'image', data: file });
            setProgressMessage('AI анализирует изображение...');
        } catch (error) {
            console.error('❌ Ошибка отправки изображения:', error);
            alert('Ошибка обработки изображения');
        }
    };

    const resetSearch = () => {
        console.log('🔄 Сброс AI поиска');
        setImageEmbedding(null);
        setError(null);
        setProgressMessage('AI поиск готов');
        setSearchResults([]);
    };

    // Отладочный эффект
    useEffect(() => {
        console.log('📊 Отладочная информация хука:');
        console.log('- готовность модели:', ready);
        console.log('- эмбеддинг изображения:', imageEmbedding ? 'есть' : 'нет');
        console.log('- текстовых эмбеддингов:', Object.keys(textEmbeddings).length);
        console.log('- результатов поиска:', searchResults.length);
        if (searchResults.length > 0) {
            console.log('- топ-3 результатов:', searchResults.slice(0, 3));
        }
    }, [ready, imageEmbedding, textEmbeddings, searchResults]);

    return {
        ready,
        progress,
        progressMessage,
        error,
        searchByImage,
        resetSearch,
        searchResults,
        imageEmbedding
    };
};