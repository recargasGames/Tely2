// ==================== BASE DE DATOS ====================

// Función para generar enlace con TMDB
function generateTMDBUrl(tmdbId, type, season = null, episode = null) {
    if (!tmdbId) return null;
    
    if (type === 'pelicula') {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&lang=es&sub=es`;
    } else if (type === 'serie' && season && episode) {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}&lang=es&sub=es`;
    }
    return null;
}

// Cargar contenido
function loadContent(containerId, filter = 'all', searchTerm = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Cargando contenido...</p>
        </div>
    `;

    database.ref('content').orderByChild('createdAt').on('value', (snapshot) => {
        const data = snapshot.val();
        let items = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                items.push({
                    id: key,
                    ...data[key]
                });
            });
            items.reverse();
        }

        // Aplicar filtros
        if (filter !== 'all') {
            items = items.filter(item => item.type === filter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item => 
                item.title.toLowerCase().includes(term) ||
                (item.description && item.description.toLowerCase().includes(term))
            );
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🎬</div>
                    <p>No hay contenido disponible</p>
                    <p style="font-size:14px;color:#666;">Agrega contenido desde el panel de administración</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="movie-card" onclick="openModal('${item.id}')">
                <div class="card-image">
                    <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image'">
                    <div class="badge-type">${item.type === 'pelicula' ? '🎬' : '📺'}</div>
                    <div class="badge-top">${item.year || 'N/A'}</div>
                    <div class="card-overlay">
                        <div class="play-btn">▶</div>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${item.title}</h3>
                    <div class="meta">
                        <span class="year">${item.year || 'Año desconocido'}</span>
                        <span class="type-badge ${item.type === 'pelicula' ? 'badge-pelicula' : 'badge-serie'}">
                            ${item.type === 'pelicula' ? 'Película' : 'Serie'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Cargar contenido destacado
function loadFeaturedContent() {
    const container = document.getElementById('featuredGrid');
    if (!container) return;

    database.ref('content').orderByChild('createdAt').limitToLast(6).on('value', (snapshot) => {
        const data = snapshot.val();
        let items = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                items.push({
                    id: key,
                    ...data[key]
                });
            });
            items.reverse();
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">⭐</div>
                    <p>No hay contenido destacado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="movie-card" onclick="openModal('${item.id}')">
                <div class="card-image">
                    <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image'">
                    <div class="badge-type">${item.type === 'pelicula' ? '🎬' : '📺'}</div>
                    <div class="card-overlay">
                        <div class="play-btn">▶</div>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${item.title}</h3>
                    <div class="meta">
                        <span class="year">${item.year || 'Año desconocido'}</span>
                        <span class="type-badge ${item.type === 'pelicula' ? 'badge-pelicula' : 'badge-serie'}">
                            ${item.type === 'pelicula' ? 'Película' : 'Serie'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Abrir modal
function openModal(id) {
    // Verificar si el usuario está logueado
    const user = auth.currentUser;
    if (!user) {
        if (confirm('🔒 Para ver este contenido necesitas iniciar sesión. ¿Deseas ir al login?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    database.ref(`content/${id}`).once('value', (snapshot) => {
        const item = snapshot.val();
        if (!item) {
            alert('Contenido no encontrado');
            return;
        }

        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modalContent');

        // Generar enlaces
        let videoLinkHTML = '';
        let episodesHTML = '';

        if (item.type === 'pelicula') {
            const videoUrl = item.videoUrl || generateTMDBUrl(item.tmdbId, 'pelicula');
            if (videoUrl) {
                videoLinkHTML = `
                    <a href="${videoUrl}" target="_blank" class="btn btn-primary btn-lg" style="margin:15px 0;width:100%;justify-content:center;">
                        ▶ Ver Película
                    </a>
                `;
            }
        } else if (item.type === 'serie') {
            if (item.episodes && item.episodes.length > 0) {
                // Generar enlaces para cada episodio
                const episodesList = item.episodes.map((ep, index) => {
                    // Intentar extraer temporada y episodio del título
                    const match = ep.title.match(/Temporada\s*(\d+)\s*[-–]\s*Episodio\s*(\d+)/i);
                    let url = ep.url;
                    
                    if (!url && item.tmdbId) {
                        if (match) {
                            const season = match[1];
                            const episode = match[2];
                            url = generateTMDBUrl(item.tmdbId, 'serie', season, episode);
                        } else {
                            // Si no se puede extraer, usar el primer episodio
                            const season = 1;
                            const episode = index + 1;
                            url = generateTMDBUrl(item.tmdbId, 'serie', season, episode);
                        }
                    }
                    
                    return `
                        <a href="${url || '#'}" target="_blank" class="episode-link">
                            <span class="episode-number">${match ? `T${match[1]}E${match[2]}` : `E${index + 1}`}</span>
                            ${ep.title}
                            ${url ? '' : ' 🔒 Sin enlace'}
                        </a>
                    `;
                }).join('');

                episodesHTML = `
                    <h3 style="margin-top:20px;margin-bottom:15px;">📺 Episodios</h3>
                    <div class="episode-list">
                        ${episodesList}
                    </div>
                `;

                // Enlace para ver la serie completa (primer episodio)
                const firstEpisode = item.episodes[0];
                const firstMatch = firstEpisode.title.match(/Temporada\s*(\d+)\s*[-–]\s*Episodio\s*(\d+)/i);
                let firstUrl = firstEpisode.url;
                if (!firstUrl && item.tmdbId) {
                    if (firstMatch) {
                        firstUrl = generateTMDBUrl(item.tmdbId, 'serie', firstMatch[1], firstMatch[2]);
                    } else {
                        firstUrl = generateTMDBUrl(item.tmdbId, 'serie', 1, 1);
                    }
                }
                
                if (firstUrl) {
                    videoLinkHTML = `
                        <a href="${firstUrl}" target="_blank" class="btn btn-primary btn-lg" style="margin:15px 0;width:100%;justify-content:center;">
                            ▶ Ver Serie (Episodio 1)
                        </a>
                    `;
                }
            }
        }

        modalContent.innerHTML = `
            <span class="modal-close" onclick="closeModal()">✕</span>
            <div class="poster-container">
                <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/800x450/1a1a2e/ffffff?text=No+Image'">
            </div>
            <h2>${item.title}</h2>
            <div class="info-grid">
                <p><strong>📅 Año:</strong> ${item.year || 'N/A'}</p>
                <p><strong>🎭 Tipo:</strong> ${item.type === 'pelicula' ? '🎬 Película' : '📺 Serie'}</p>
                ${item.tmdbId ? `<p><strong>🆔 TMDB:</strong> ${item.tmdbId}</p>` : ''}
                <p><strong>👤 Agregado por:</strong> ${auth.currentUser?.displayName || 'Usuario'}</p>
            </div>
            ${item.description ? `<div class="description">${item.description}</div>` : ''}
            ${videoLinkHTML}
            ${episodesHTML}
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Cerrar modal
function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) closeModal();
});
