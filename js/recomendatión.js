// ==================== SISTEMA DE RECOMENDACIONES ====================

function generateRecommendations(history, allMovies, allSeries) {
    if (!history || history.length === 0) {
        // Recomendaciones por defecto
        return [...allMovies.slice(0, 5), ...allSeries.slice(0, 5)];
    }

    // Obtener géneros favoritos del usuario
    const genreScores = {};
    const directorScores = {};
    const actorScores = {};

    // Analizar historial
    history.forEach(entry => {
        const item = allMovies.find(m => m.id == entry.id) || allSeries.find(s => s.id == entry.id);
        if (!item) return;

        // Géneros
        if (item.genre_ids) {
            item.genre_ids.forEach(genreId => {
                genreScores[genreId] = (genreScores[genreId] || 0) + 1;
            });
        }
    });

    // Ordenar géneros por preferencia
    const sortedGenres = Object.keys(genreScores).sort((a, b) => genreScores[b] - genreScores[a]);

    // Buscar recomendaciones basadas en géneros
    const recommendations = [];
    const seenIds = new Set(history.map(h => h.id));

    // Películas
    allMovies.forEach(movie => {
        if (seenIds.has(movie.id)) return;
        
        let score = 0;
        if (movie.genre_ids) {
            movie.genre_ids.forEach(genreId => {
                score += genreScores[genreId] || 0;
            });
        }
        
        // Popularidad como factor adicional
        score += (movie.popularity || 0) / 100;
        
        if (score > 0) {
            recommendations.push({ ...movie, type: 'movie', score });
        }
    });

    // Series
    allSeries.forEach(series => {
        if (seenIds.has(series.id)) return;
        
        let score = 0;
        if (series.genre_ids) {
            series.genre_ids.forEach(genreId => {
                score += genreScores[genreId] || 0;
            });
        }
        
        score += (series.popularity || 0) / 100;
        
        if (score > 0) {
            recommendations.push({ ...series, type: 'tv', score });
        }
    });

    // Ordenar por puntuación
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
}

// ==================== RECOMENDACIONES PERSONALIZADAS ====================
async function getPersonalizedRecommendations(userId) {
    try {
        // Obtener historial del usuario
        const historySnapshot = await database.ref(`history/${userId}`).once('value');
        const historyData = historySnapshot.val() || {};
        const history = Object.values(historyData).sort((a, b) => b.timestamp - a.timestamp);

        // Obtener todos los contenidos
        const movies = await getAllMovies();
        const series = await getAllSeries();

        // Generar recomendaciones
        const recommendations = generateRecommendations(history, movies, series);

        return recommendations.slice(0, 20);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
    }
}

// ==================== CONTENIDO SIMILAR ====================
async function getSimilarContent(contentId, type, limit = 6) {
    try {
        const url = type === 'movie'
            ? `${TMDB_BASE_URL}/movie/${contentId}/similar?api_key=${TMDB_API_KEY}&language=es-ES`
            : `${TMDB_BASE_URL}/tv/${contentId}/similar?api_key=${TMDB_API_KEY}&language=es-ES`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data.results.slice(0, limit).map(item => ({
            ...item,
            media_type: type === 'movie' ? 'movie' : 'tv'
        }));
    } catch (error) {
        console.error('Error getting similar:', error);
        return [];
    }
}

// ==================== RECOMENDACIONES POR GÉNERO ====================
async function getRecommendationsByGenre(genre, limit = 10) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre}&language=es-ES&page=1`
        );
        const data = await response.json();
        return data.results.slice(0, limit).map(m => ({ ...m, media_type: 'movie' }));
    } catch (error) {
        console.error('Error getting recommendations by genre:', error);
        return [];
    }
}

console.log('✅ Sistema de recomendaciones cargado');
