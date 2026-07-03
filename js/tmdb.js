// ==================== API DE TMDB ====================
const TMDB_API_KEY = '6196750b1fd09dd276a6106e75ee34f6';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// ==================== FUNCIONES PRINCIPALES ====================

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

async function getMovieDetails(id) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
        );
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function getSeriesDetails(id) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
        );
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function searchContent(query, type = 'all') {
    try {
        let results = [];
        
        if (type === 'all' || type === 'movie') {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
            );
            const data = await response.json();
            results = [...results, ...(data.results || []).map(m => ({ ...m, media_type: 'movie' }))];
        }
        
        if (type === 'all' || type === 'tv') {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
            );
            const data = await response.json();
            results = [...results, ...(data.results || []).map(m => ({ ...m, media_type: 'tv' }))];
        }
        
        return results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function getPosterUrl(path) {
    return path ? `${IMAGE_BASE_URL}w500${path}` : 'https://via.placeholder.com/300x450/1A1A1A/ffffff?text=No+Image';
}

console.log('✅ TMDB API cargada');
