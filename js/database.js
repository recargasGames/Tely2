// ==================== BASE DE DATOS ====================

// Cargar contenido
function loadContent(containerId, filter = 'all', searchTerm = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando contenido...</div>';

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
            items.reverse(); // Más reciente primero
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
            container.innerHTML = '<div class="empty-state">No hay contenido disponible</div>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="movie-card" onclick="openModal('${item.id}')">
                <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image'">
                <div class="movie-info">
                    <h3>${item.title}</h3>
                    <div class="year">${item.year || 'Año desconocido'}</div>
                    <span class="type-badge ${item.type === 'pelicula' ? 'badge-pelicula' : 'badge-serie'}">
                        ${item.type === 'pelicula' ? '🎬 Película' : '📺 Serie'}
                    </span>
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
            container.innerHTML = '<div class="empty-state">No hay contenido destacado</div>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="movie-card" onclick="openModal('${item.id}')">
                <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image'">
                <div class="movie-info">
                    <h3>${item.title}</h3>
                    <div class="year">${item.year || 'Año desconocido'}</div>
                    <span class="type-badge ${item.type === 'pelicula' ? 'badge-pelicula' : 'badge-serie'}">
                        ${item.type === 'pelicula' ? '🎬' : '📺'}
                    </span>
                </div>
            </div>
        `).join('');
    });
}

// Abrir modal
function openModal(id) {
    database.ref(`content/${id}`).once('value', (snapshot) => {
        const item = snapshot.val();
        if (!item) {
            alert('Contenido no encontrado');
            return;
        }

        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modalContent');

        let episodesHTML = '';
        if (item.type === 'serie' && item.episodes && item.episodes.length > 0) {
            episodesHTML = `
                <h3>📺 Episodios</h3>
                <div class="episode-list">
                    ${item.episodes.map(ep => `
                        <a href="${ep.url}" target="_blank" class="episode-link">
                            ▶ ${ep.title}
                        </a>
                    `).join('')}
                </div>
            `;
        }

        modalContent.innerHTML = `
            <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image'">
            <h2>${item.title}</h2>
            <p><strong>📅 Año:</strong> ${item.year || 'N/A'}</p>
            <p><strong>🎭 Tipo:</strong> ${item.type === 'pelicula' ? '🎬 Película' : '📺 Serie'}</p>
            ${item.description ? `<p><strong>📝 Descripción:</strong><br>${item.description}</p>` : ''}
            ${item.videoUrl ? `<a href="${item.videoUrl}" target="_blank" class="btn btn-primary" style="margin:10px 0;">▶ Ver Contenido</a>` : ''}
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
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});
