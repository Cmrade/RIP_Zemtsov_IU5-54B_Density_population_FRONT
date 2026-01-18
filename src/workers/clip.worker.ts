self.addEventListener('message', async (event) => {
    const { type, data } = event.data;
    
    console.log(`📨 Worker получил сообщение: ${type}`);

    try {
        if (type === 'init') {
            console.log('Инициализация с данными:', data);
            
            // Симуляция загрузки модели
            for (let i = 0; i <= 100; i += 10) {
                self.postMessage({ 
                    type: 'progress', 
                    data: { status: 'progress', progress: i } 
                });
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Создаем фиктивные эмбеддинги для каждого элемента
            // В реальности здесь будет модель CLIP
            const embeddings: Record<number, number[]> = {};
            
            data.forEach((item: any) => {
                // Создаем детерминированные эмбеддинги на основе ID
                // Это позволяет тестировать логику поиска
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
            
            console.log('Созданы фиктивные эмбеддинги:', Object.keys(embeddings));
            
            self.postMessage({ 
                type: 'text_embeddings_ready', 
                data: embeddings 
            });
        }
        
        if (type === 'image') {
            console.log('Обработка изображения:', data.name);
            
            // Создаем фиктивный эмбеддинг для изображения
            // В реальности здесь будет обработка через CLIP
            const imageEmbedding = new Array(512).fill(0);
            
            // В зависимости от типа изображения создаем разные эмбеддинги
            const fileName = data.name.toLowerCase();
            
            // Простая логика для теста
            if (fileName.includes('деревня') || fileName.includes('village') || fileName.includes('село')) {
                // Эмбеддинг похожий на село (id=3)
                for (let i = 0; i < 512; i++) {
                    imageEmbedding[i] = Math.sin(i * 0.05) * 0.3 + 0.15; // Похоже на село
                }
            } else if (fileName.includes('город') || fileName.includes('city') || fileName.includes('город')) {
                // Эмбеддинг похожий на город (id=1)
                for (let i = 0; i < 512; i++) {
                    imageEmbedding[i] = Math.sin(i * 0.1) * 0.5 + 0.35; // Похоже на город
                }
            } else if (fileName.includes('крепость') || fileName.includes('fortress')) {
                // Эмбеддинг похожий на крепость (id=2)
                for (let i = 0; i < 512; i++) {
                    imageEmbedding[i] = Math.cos(i * 0.15) * 0.5 + 0.25; // Похоже на крепость
                }
            } else {
                // Случайный эмбеддинг
                for (let i = 0; i < 512; i++) {
                    imageEmbedding[i] = Math.random() * 0.2;
                }
            }
            
            console.log('Создан эмбеддинг изображения, длина:', imageEmbedding.length);
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