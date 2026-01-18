export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
        return 0;
    }
    
    if (vecA.length !== vecB.length) {
        console.warn(`Разные длины векторов: ${vecA.length} и ${vecB.length}`);
        // Обрезаем до минимальной длины
        const minLength = Math.min(vecA.length, vecB.length);
        vecA = vecA.slice(0, minLength);
        vecB = vecB.slice(0, minLength);
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        const a = vecA[i];
        const b = vecB[i];
        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }
    
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    
    // Косинусное сходство может быть от -1 до 1
    // Нормализуем в диапазон 0-1 для удобства отображения
    const normalized = (similarity + 1) / 2;
    
    // Ограничиваем от 0 до 1 на всякий случай
    return Math.max(0, Math.min(1, normalized));
}