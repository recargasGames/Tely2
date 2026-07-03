// ==================== API DE TMDB ====================
const TMDB_API_KEY = '6196750b1fd09dd276a6106e75ee34f6';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// ==================== FUNCIONES ====================

// Obtener películas populares
async function getPopularMovies(page = 1) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener series populares
async function getPopularSeries(page = 1) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener películas en cartelera
async function getNowPlayingMovies(page = 1) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener series en emisión
async function getOnTheAirSeries(page = 1) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Buscar contenido
async function searchContent(query, type = 'all') {
    try {
        let results = [];
        
        if (type === 'all' || type === 'pelicula') {
            const movieResponse = await fetch(
                `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
            );
            const movieData = await movieResponse.json();
            results = [...results, ...(movieData.results || []).map(m => ({ ...m, media_type: 'movie' }))];
        }
        
        if (type === 'all' || type === 'serie') {
            const tvResponse = await fetch(
                `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
            );
            const tvData = await tvResponse.json();
            results = [...results, ...(tvData.results || []).map(m => ({ ...m, media_type: 'tv' }))];
        }
        
        return results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener detalles de película
async function getMovieDetails(movieId) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-ES`
        );
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Obtener detalles de serie
async function getSeriesDetails(seriesId) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}&language=es-ES`
        );
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Generar enlace de película
function getMovieUrl(tmdbId) {
    return `https://unlimplay.co/play/movie/${tmdbId}`;
}

// Generar enlace de serie
function getSeriesUrl(tmdbId, season, episode) {
    return `https://unlimplay.co/play/tv/${tmdbId}/${season}/${episode}`;
}

// Generar URL del poster
function getPosterUrl(path) {
    return path ? `${IMAGE_BASE_URL}${path}` : 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image';
}
