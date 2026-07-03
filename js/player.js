// ==================== REPRODUCTOR ====================
const video = document.getElementById('playerVideo');
const videoSource = document.getElementById('videoSource');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressBuffer = document.getElementById('progressBuffer');
const progressDot = document.getElementById('progressDot');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const playPauseBtn = document.getElementById('playPauseBtn');
const bigPlayBtn = document.getElementById('bigPlayBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const controls = document.getElementById('playerControls');
const overlay = document.getElementById('playerOverlay');
const loading = document.getElementById('playerLoading');
const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');

let isPlaying = false;
let isFullscreen = false;
let controlsTimeout = null;
let currentContent = null;
let currentType = null;
let currentSeason = null;
let currentEpisode = null;
let episodesList = [];

// ==================== OBTENER PARÁMETROS ====================
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        type: params.get('type'),
        season: params.get('season'),
        episode: params.get('episode')
    };
}

// ==================== INICIALIZAR ====================
document.addEventListener('DOMContentLoaded', async () => {
    const params = getUrlParams();
    const user = auth.currentUser;
    
    if (!user) {
        alert('Inicia sesión para ver contenido');
        window.location.href = 'login.html';
        return;
    }

    if (!params.id || !params.type) {
        alert('Contenido no válido');
        window.location.href = 'index.html';
        return;
    }

    await loadContent(params.id, params.type, params.season, params.episode);
    setupPlayer();
    loadSavedProgress(params.id);
});

// ==================== CARGAR CONTENIDO ====================
async function loadContent(id, type, season, episode) {
    loading.classList.add('active');
    currentContent = { id, type };
    currentSeason = season || 1;
    currentEpisode = episode || 1;

    try {
        let data;
        let videoUrl;
        let title;

        if (type === 'movie') {
            data = await getMovieDetails(id);
            videoUrl = getMovieUrl(id);
            title = data.title;
        } else {
            data = await getSeriesDetails(id);
            videoUrl = getSeriesUrl(id, currentSeason, currentEpisode);
            title = data.name;
            
            // Cargar episodios
            if (data.seasons) {
                const validSeasons = data.seasons.filter(s => s.season_number > 0);
                if (validSeasons.length > 0) {
                    const seasonData = validSeasons.find(s => s.season_number == currentSeason) || validSeasons[0];
                    const epCount = seasonData.episode_count || 10;
                    episodesList = Array.from({length: Math.min(epCount, 20)}, (_, i) => ({
                        number: i + 1,
                        title: `Episodio ${i + 1}`
                    }));
                    
                    if (episodesList.length > 0) {
                        document.getElementById('playerEpisodes').style.display = 'block';
                        renderEpisodes(episodesList, currentEpisode);
                    }
                }
            }
        }

        // Actualizar título
        document.getElementById('playerTitle').textContent = title;

        // Cargar video
        videoSource.src = videoUrl;
        video.load();

        // Guardar en historial
        saveToHistory(id, type);

        // Mostrar botón de siguiente episodio
        if (type === 'serie' && episodesList.length > 0) {
            const nextEp = episodesList.find(e => e.number > currentEpisode);
            if (nextEp) {
                nextEpisodeBtn.style.display = 'flex';
                nextEpisodeBtn.onclick = () => {
                    currentEpisode = nextEp.number;
                    loadContent(id, type, currentSeason, currentEpisode);
                };
            }
        }

    } catch (error) {
        console.error('Error loading content:', error);
        alert('Error al cargar el contenido');
        loading.classList.remove('active');
    }
}

function renderEpisodes(episodes, current) {
    const container = document.getElementById('episodesList');
    container.innerHTML = episodes.map(ep => `
        <div class="episode-item ${ep.number === current ? 'active' : ''}" 
             onclick="loadEpisode(${ep.number})">
            <span class="episode-title">${ep.title}</span>
            <span class="episode-status">${ep.number === current ? '▶ Reproduciendo' : ''}</span>
        </div>
    `).join('');
}

function loadEpisode(number) {
    const params = getUrlParams();
    currentEpisode = number;
    loadContent(params.id, params.type, currentSeason, currentEpisode);
}

// ==================== REPRODUCTOR ====================
function setupPlayer() {
    // Eventos del video
    video.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(video.duration);
        loading.classList.remove('active');
    });

    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(video.currentTime);
        
        // Guardar progreso cada 5 segundos
        if (Math.floor(video.currentTime) % 5 === 0) {
            saveProgress(video.currentTime);
        }
    });

    video.addEventListener('waiting', () => {
        loading.classList.add('active');
    });

    video.addEventListener('canplay', () => {
        loading.classList.remove('active');
    });

    video.addEventListener('ended', () => {
        handleVideoEnd();
    });

    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlay);
    bigPlayBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    overlay.addEventListener('click', togglePlay);

    // Controles de tiempo
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
    });

    // Adelantar/Retroceder
    rewindBtn.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
    });

    forwardBtn.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
    });

    // Volumen
    volumeSlider.addEventListener('input', (e) => {
        video.volume = parseFloat(e.target.value);
        updateVolumeIcon(video.volume);
    });

    volumeBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        updateVolumeIcon(video.muted ? 0 : video.volume);
    });

    // Pantalla completa
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Mostrar/ocultar controles
    document.addEventListener('mousemove', showControls);
    document.addEventListener('touchstart', showControls);

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.key) {
            case ' ':
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'ArrowRight':
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
                break;
            case 'ArrowLeft':
                video.currentTime = Math.max(0, video.currentTime - 5);
                break;
            case 'm':
                video.muted = !video.muted;
                updateVolumeIcon(video.muted ? 0 : video.volume);
                break;
        }
    });

    // Cargar progreso guardado
    video.addEventListener('loadedmetadata', () => {
        const savedTime = localStorage.getItem(`progress_${currentContent.id}`);
        if (savedTime) {
            const time = parseFloat(savedTime);
            if (time > 0 && time < video.duration - 10) {
                video.currentTime = time;
            }
        }
    });

    // Auto-play
    video.play().then(() => {
        isPlaying = true;
        updatePlayPauseIcon();
        bigPlayBtn.classList.remove('visible');
    }).catch(() => {
        isPlaying = false;
        updatePlayPauseIcon();
        bigPlayBtn.classList.add('visible');
    });

    showControls();
}

// ==================== FUNCIONES DE CONTROL ====================
function togglePlay() {
    if (video.paused) {
        video.play();
        isPlaying = true;
        bigPlayBtn.classList.remove('visible');
    } else {
        video.pause();
        isPlaying = false;
        bigPlayBtn.classList.add('visible');
    }
    updatePlayPauseIcon();
    showControls();
}

function updatePlayPauseIcon() {
    const icon = playPauseBtn.querySelector('.material-icons');
    const bigIcon = bigPlayBtn.querySelector('.material-icons');
    icon.textContent = isPlaying ? 'pause' : 'play_arrow';
    bigIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
}

function updateVolumeIcon(volume) {
    const icon = volumeBtn.querySelector('.material-icons');
    if (volume === 0 || video.muted) {
        icon.textContent = 'volume_off';
    } else if (volume < 0.5) {
        icon.textContent = 'volume_down';
    } else {
        icon.textContent = 'volume_up';
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        isFullscreen = true;
        fullscreenBtn.querySelector('.material-icons').textContent = 'fullscreen_exit';
    } else {
        document.exitFullscreen();
        isFullscreen = false;
        fullscreenBtn.querySelector('.material-icons').textContent = 'fullscreen';
    }
}

function showControls() {
    controls.classList.add('visible');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        if (isPlaying) {
            controls.classList.remove('visible');
        }
    }, 3000);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==================== GUARDAR PROGRESO ====================
function saveProgress(currentTime) {
    const user = auth.currentUser;
    if (!user) return;

    const contentId = currentContent.id;
    const type = currentContent.type;
    
    // Guardar en Firebase
    const progressRef = database.ref(`progress/${user.uid}/${contentId}`);
    progressRef.update({
        time: currentTime,
        season: currentSeason || 1,
        episode: currentEpisode || 1,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // Guardar localmente
    localStorage.setItem(`progress_${contentId}`, currentTime);
}

function loadSavedProgress(contentId) {
    const savedTime = localStorage.getItem(`progress_${contentId}`);
    if (savedTime) {
        const time = parseFloat(savedTime);
        if (time > 0) {
            video.addEventListener('loadedmetadata', () => {
                if (time < video.duration - 5) {
                    video.currentTime = time;
                }
            });
        }
    }
}

function saveToHistory(id, type) {
    const user = auth.currentUser;
    if (!user) return;

    const historyRef = database.ref(`history/${user.uid}/${id}`);
    historyRef.set({
        id: id,
        type: type,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// ==================== FIN DE VIDEO ====================
function handleVideoEnd() {
    const params = getUrlParams();
    
    if (params.type === 'serie') {
        // Buscar siguiente episodio
        const nextEp = episodesList.find(e => e.number > currentEpisode);
        if (nextEp) {
            if (confirm('¿Siguiente episodio?')) {
                currentEpisode = nextEp.number;
                loadContent(params.id, params.type, currentSeason, currentEpisode);
                return;
            }
        }
    }
    
    // Marcar como completado
    const user = auth.currentUser;
    if (user) {
        const progressRef = database.ref(`progress/${user.uid}/${params.id}`);
        progressRef.update({
            completed: true,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    bigPlayBtn.classList.add('visible');
    isPlaying = false;
    updatePlayPauseIcon();
}

// ==================== NAVEGACIÓN ====================
function goBack() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    window.history.back();
}

// ==================== FUNCIONES DE API ====================
async function getMovieDetails(id) {
    const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    return response.json();
}

async function getSeriesDetails(id) {
    const response = await fetch(
        `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    return response.json();
}

function getMovieUrl(id) {
    return `https://unlimplay.co/play/movie/${id}`;
}

function getSeriesUrl(id, season, episode) {
    return `https://unlimplay.co/play/tv/${id}/${season}/${episode}`;
}

console.log('✅ Reproductor cargado correctamente');
