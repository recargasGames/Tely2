// ==================== BASE DE DATOS Y RENDERIZADO ====================

// Renderizar tarjetas
function renderCards(containerId, items, title = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🎬</div>
                <p>No hay contenido disponible</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => {
        const isMovie = item.media_type === 'movie' || item.media_type === 'movie' || !item.media_type;
        const titleText = item.title || item.name;
        const year = item.release_date || item.first_air_date || '';
        const poster = getPosterUrl(item.poster_path);
        const id = item.id;
        const typeLabel = isMovie ? 'Película' : 'Serie';
        const badgeClass = isMovie ? 'badge-pelicula' : 'badge-serie';
        const icon = isMovie ? '🎬' : '📺';

        return `
            <div class="movie-card" onclick="openModalTMDB(${id}, '${isMovie ? 'movie' : 'tv'}')">
                <div class="card-image">
                    <img src="${poster}" alt="${titleText}" loading="lazy">
                    <div class="badge-type">${icon}</div>
                    <div class="badge-top">${year ? year.substring(0, 4) : 'N/A'}</div>
                    <div class="card-overlay">
                        <div class="play-btn">▶</div>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${titleText}</h3>
                    <div class="meta">
                        <span class="year">${year ? year.substring(0, 4) : 'Año desconocido'}</span>
                        <span class="type-badge ${badgeClass}">${typeLabel}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Cargar contenido en una sección
async function loadSection(containerId, type = 'movie', filter = 'popular', page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Cargando...</p>
        </div>
    `;

    try {
        let items = [];
        
        if (type === 'movie') {
            if (filter === 'popular') {
                items = await getPopularMovies(page);
            } else if (filter === 'now_playing') {
                items = await getNowPlayingMovies(page);
            }
            items = items.map(m => ({ ...m, media_type: 'movie' }));
        } else if (type === 'tv') {
            if (filter === 'popular') {
                items = await getPopularSeries(page);
            } else if (filter === 'on_the_air') {
                items = await getOnTheAirSeries(page);
            }
            items = items.map(m => ({ ...m, media_type: 'tv' }));
        }

        renderCards(containerId, items);
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <p>Error al cargar el contenido</p>
            </div>
        `;
    }
}

// Buscar contenido
async function searchContentAndRender(containerId, query, type = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!query || query.trim() === '') {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <p>Escribe algo para buscar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Buscando...</p>
        </div>
    `;

    try {
        const results = await searchContent(query, type);
        renderCards(containerId, results);
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <p>Error al buscar</p>
            </div>
        `;
    }
}

// Abrir modal con detalles
async function openModalTMDB(id, type) {
    const user = auth.currentUser;
    if (!user) {
        if (confirm('🔒 Para ver este contenido necesitas iniciar sesión. ¿Deseas ir al login?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Cargando detalles...</p>
        </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
        let data;
        let isMovie = type === 'movie';
        
        if (isMovie) {
            data = await getMovieDetails(id);
        } else {
            data = await getSeriesDetails(id);
        }

        if (!data) {
            modalContent.innerHTML = `
                <span class="modal-close" onclick="closeModal()">✕</span>
                <p>No se encontraron detalles</p>
            `;
            return;
        }

        const title = data.title || data.name;
        const year = data.release_date || data.first_air_date || '';
        const poster = getPosterUrl(data.poster_path);
        const overview = data.overview || 'Sin descripción disponible';
        const voteAverage = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
        const genres = data.genres ? data.genres.map(g => g.name).join(', ') : 'No especificado';

        let videoLinkHTML = '';
        let episodesHTML = '';

        if (isMovie) {
            const movieUrl = getMovieUrl(id);
            videoLinkHTML = `
                <a href="${movieUrl}" target="_blank" class="btn btn-primary btn-lg" style="margin:15px 0;width:100%;justify-content:center;">
                    ▶ Ver Película
                </a>
            `;
        } else {
            if (data.seasons && data.seasons.length > 0) {
                const seasons = data.seasons.filter(s => s.season_number > 0);
                if (seasons.length > 0) {
                    const firstSeason = seasons[0];
                    const seasonNumber = firstSeason.season_number;
                    
                    const episodesList = [];
                    for (let i = 1; i <= Math.min(firstSeason.episode_count || 10, 20); i++) {
                        const seriesUrl = getSeriesUrl(id, seasonNumber, i);
                        episodesList.push(`
                            <a href="${seriesUrl}" target="_blank" class="episode-link">
                                <span class="episode-number">T${seasonNumber}E${i}</span>
                                Episodio ${i}
                            </a>
                        `);
                    }
                    
                    episodesHTML = `
                        <h3 style="margin-top:20px;margin-bottom:15px;">📺 Temporada ${seasonNumber}</h3>
                        <div class="episode-list">
                            ${episodesList.join('')}
                        </div>
                    `;
                    
                    const firstUrl = getSeriesUrl(id, seasonNumber, 1);
                    videoLinkHTML = `
                        <a href="${firstUrl}" target="_blank" class="btn btn-primary btn-lg" style="margin:15px 0;width:100%;justify-content:center;">
                            ▶ Ver Serie
                        </a>
                    `;
                }
            }
        }

        modalContent.innerHTML = `
            <span class="modal-close" onclick="closeModal()">✕</span>
            <div class="poster-container">
                <img src="${poster}" alt="${title}">
            </div>
            <h2>${title}</h2>
            <div class="info-grid">
                <p><strong>📅 Año:</strong> ${year ? year.substring(0, 4) : 'N/A'}</p>
                <p><strong>🎭 Tipo:</strong> ${isMovie ? '🎬 Película' : '📺 Serie'}</p>
                <p><strong>⭐ Rating:</strong> ⭐ ${voteAverage}/10</p>
                <p><strong>🎭 Géneros:</strong> ${genres}</p>
            </div>
            <div class="description">${overview}</div>
            ${videoLinkHTML}
            ${episodesHTML}
        `;

    } catch (error) {
        console.error('Error:', error);
        modalContent.innerHTML = `
            <span class="modal-close" onclick="closeModal()">✕</span>
            <p>❌ Error al cargar los detalles</p>
        `;
    }
}

// Cerrar modal
function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) closeModal();
});
