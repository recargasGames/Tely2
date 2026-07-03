// ==================== ADMIN PANEL ====================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        loadAdminContent();
    });
    
    // Tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('tab-' + this.dataset.tab).classList.add('active');
            if (this.dataset.tab === 'manage') loadManageContent();
            if (this.dataset.tab === 'stats') loadStats();
        });
    });
    
    // Formulario
    document.getElementById('adminForm').addEventListener('submit', saveContent);
    document.getElementById('searchManage').addEventListener('input', function() {
        loadManageContent(this.value);
    });
    
    loadManageContent();
    loadStats();
});

// ===== AGREGAR EPISODIO =====
function addEpisode() {
    const container = document.getElementById('episodeList');
    const div = document.createElement('div');
    div.className = 'episode-item';
    const count = container.children.length + 1;
    div.innerHTML = `
        <input type="text" placeholder="Temporada X - Episodio X" value="Temporada 1 - Episodio ${count}">
        <input type="text" placeholder="URL del video (opcional)">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeEpisode(this)">✖</button>
    `;
    container.appendChild(div);
}

function removeEpisode(btn) {
    const items = document.querySelectorAll('.episode-item');
    if (items.length > 1) {
        btn.parentElement.remove();
    } else {
        alert('Debe haber al menos un episodio');
    }
}

// ===== GUARDAR CONTENIDO =====
async function saveContent(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const year = document.getElementById('year').value;
    const poster = document.getElementById('poster').value || 'https://via.placeholder.com/300x450/1A1A1A/ffffff?text=No+Image';
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const tmdbId = document.getElementById('tmdbId').value;
    const customUrl = document.getElementById('customUrl').value;
    
    // Generar URL
    let videoUrl = customUrl;
    if (!videoUrl && tmdbId && type === 'pelicula') {
        videoUrl = `https://unlimplay.co/play/movie/${tmdbId}`;
    }
    
    // Obtener episodios
    const episodeItems = document.querySelectorAll('.episode-item');
    const episodes = [];
    if (type === 'serie') {
        episodeItems.forEach((item, index) => {
            const inputs = item.querySelectorAll('input');
            const epTitle = inputs[0].value || `Episodio ${index + 1}`;
            let epUrl = inputs[1].value;
            
            if (!epUrl && tmdbId) {
                const match = epTitle.match(/Temporada\s*(\d+)\s*[-–]\s*Episodio\s*(\d+)/i);
                if (match) {
                    epUrl = `https://unlimplay.co/play/tv/${tmdbId}/${match[1]}/${match[2]}`;
                } else {
                    epUrl = `https://unlimplay.co/play/tv/${tmdbId}/1/${index + 1}`;
                }
            }
            
            episodes.push({
                title: epTitle,
                url: epUrl || ''
            });
        });
    }
    
    const content = {
        title,
        year: year || new Date().getFullYear().toString(),
        poster,
        type,
        description,
        tmdbId,
        videoUrl: videoUrl || '',
        customUrl: customUrl || '',
        episodes: type === 'serie' ? episodes : [],
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    try {
        const newRef = database.ref('custom_content').push();
        await newRef.set(content);
        alert('✅ Contenido guardado exitosamente!');
        document.getElementById('adminForm').reset();
        document.querySelectorAll('.episode-item').forEach((item, index) => {
            if (index > 0) item.remove();
        });
        loadManageContent();
        loadStats();
    } catch (error) {
        alert('❌ Error al guardar: ' + error.message);
    }
}

// ===== CARGAR CONTENIDO PARA ADMIN =====
function loadManageContent(searchTerm = '') {
    const grid = document.getElementById('manageGrid');
    
    database.ref('custom_content').orderByChild('createdAt').on('value', (snapshot) => {
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
        
        let filtered = items;
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-premium">
                    <div class="empty-icon">📭</div>
                    <p>No hay contenido personalizado</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filtered.map(item => `
            <div class="manage-item">
                <div class="manage-item-info">
                    <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/50x75/1A1A1A/ffffff?text=No+Image'">
                    <div>
                        <h4>${item.title}</h4>
                        <p>${item.year || 'Año desconocido'} • ${item.type === 'pelicula' ? '🎬 Película' : '📺 Serie'} ${item.tmdbId ? `• ID: ${item.tmdbId}` : ''}</p>
                    </div>
                </div>
                <div class="manage-item-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteContent('${item.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    });
}

// ===== ELIMINAR CONTENIDO =====
async function deleteContent(id) {
    if (confirm('¿Estás seguro de eliminar este contenido?')) {
        const result = await deleteCustomContent(id);
        if (result.success) {
            alert('✅ Contenido eliminado');
            loadManageContent();
            loadStats();
        } else {
            alert('❌ Error: ' + result.error);
        }
    }
}

// ===== ESTADÍSTICAS =====
function loadStats() {
    database.ref('custom_content').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        let peliculas = 0;
        let series = 0;
        
        Object.values(data).forEach(item => {
            if (item.type === 'pelicula') peliculas++;
            else if (item.type === 'serie') series++;
        });
        
        document.getElementById('totalPeliculas').textContent = peliculas;
        document.getElementById('totalSeries').textContent = series;
        document.getElementById('totalContenido').textContent = peliculas + series;
    });
}

console.log('✅ Admin panel cargado');
