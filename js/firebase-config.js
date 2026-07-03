<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Mi Cine - Mi Lista</title>
    <link rel="stylesheet" href="css/styles.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        .header-premium {
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 12px 16px;
            background: rgba(13, 13, 13, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .header-premium-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1400px;
            margin: 0 auto;
        }
        .logo-premium {
            font-size: 20px;
            font-weight: 800;
            background: linear-gradient(135deg, #E50914, #f39c12);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .menu-btn {
            background: none;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 8px;
        }
        .main-premium { max-width: 1400px; margin: 0 auto; padding: 0 16px 20px; }
        .lista-tabs {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 16px 0 12px;
            scrollbar-width: none;
        }
        .lista-tabs::-webkit-scrollbar { display: none; }
        .lista-tab {
            padding: 8px 18px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            color: #666;
            cursor: pointer;
            font-size: 13px;
            white-space: nowrap;
            transition: all 0.3s ease;
        }
        .lista-tab:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .lista-tab.active { background: #E50914; color: #fff; border-color: #E50914; }
        .lista-section { display: none; }
        .lista-section.active { display: block; }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
        }
        .content-card {
            background: #1A1A1A;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid transparent;
        }
        .content-card:hover { transform: translateY(-6px); border-color: #E50914; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
        .card-image {
            position: relative;
            aspect-ratio: 2/3;
            overflow: hidden;
        }
        .card-image img { width: 100%; height: 100%; object-fit: cover; }
        .card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .content-card:hover .card-overlay { opacity: 1; }
        .play-btn-small {
            width: 44px;
            height: 44px;
            background: #E50914;
            border: none;
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .play-btn-small .material-icons { font-size: 24px; }
        .card-progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: #E50914;
            transition: width 0.5s ease;
        }
        .card-info { padding: 12px; }
        .card-info h4 {
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .card-year, .card-progress-text { font-size: 12px; color: #888; }
        .empty-state-premium {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px 20px;
        }
        .empty-state-premium .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
        .empty-state-premium h3 { color: #fff; margin: 0 0 8px; }
        .empty-state-premium p { color: #888; margin: 0; }

        .history-list { display: flex; flex-direction: column; gap: 8px; }
        .history-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 16px;
            background: #1A1A1A;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.08);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .history-item:hover { background: #2A2A2A; border-color: #E50914; }
        .history-item img {
            width: 40px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
        }
        .history-info { flex: 1; }
        .history-info h4 { font-size: 14px; color: #fff; margin: 0; }
        .history-type { font-size: 12px; color: #888; }
        .history-time { font-size: 11px; color: #666; display: block; }
        .history-item .material-icons { color: #666; }

        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(13, 13, 13, 0.95);
            backdrop-filter: blur(20px);
            display: flex;
            justify-content: space-around;
            padding: 6px 0 12px;
            border-top: 1px solid rgba(255,255,255,0.08);
            z-index: 100;
        }
        .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            color: #666;
            text-decoration: none;
            font-size: 10px;
            transition: all 0.3s ease;
            padding: 4px 12px;
            border-radius: 8px;
            min-width: 50px;
        }
        .bottom-nav-item .material-icons { font-size: 24px; }
        .bottom-nav-item:hover { color: #fff; }
        .bottom-nav-item.active { color: #E50914; }
    </style>
</head>
<body>
    <header class="header-premium">
        <div class="header-premium-content">
            <button class="menu-btn" onclick="window.location.href='index.html'">
                <span class="material-icons">arrow_back</span>
            </button>
            <div class="logo-premium">🎬 Mi Cine</div>
            <div style="width:40px;"></div>
        </div>
    </header>

    <main class="main-premium">
        <div class="lista-tabs">
            <button class="lista-tab active" data-tab="favorites">❤️ Favoritos</button>
            <button class="lista-tab" data-tab="continue">▶️ Continuar</button>
            <button class="lista-tab" data-tab="history">📜 Historial</button>
        </div>

        <div class="lista-content">
            <div class="lista-section active" id="section-favorites">
                <div class="content-grid" id="favoritesGrid"></div>
            </div>
            <div class="lista-section" id="section-continue">
                <div class="content-grid" id="continueGrid"></div>
            </div>
            <div class="lista-section" id="section-history">
                <div class="history-list" id="historyList"></div>
            </div>
        </div>
    </main>

    <nav class="bottom-nav">
        <a href="index.html" class="bottom-nav-item">🏠 Inicio</a>
        <a href="peliculas.html" class="bottom-nav-item">🎬 Películas</a>
        <a href="series.html" class="bottom-nav-item">📺 Series</a>
        <a href="mi-lista.html" class="bottom-nav-item active">🔖 Mi Lista</a>
        <a href="perfil.html" class="bottom-nav-item">👤 Perfil</a>
    </nav>

    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script>
        const firebaseConfig = {
            apiKey: "AIzaSyBAdvlj4qzHSaPUIRIW5F51mHlnzoy1_es",
            authDomain: "tely2-245d5.firebaseapp.com",
            databaseURL: "https://tely2-245d5-default-rtdb.firebaseio.com",
            projectId: "tely2-245d5",
            storageBucket: "tely2-245d5.firebasestorage.app",
            messagingSenderId: "37996516235",
            appId: "1:37996516235:web:11f3d73fdc683de9d9558e",
            measurementId: "G-L8W50JK7N3"
        };

        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const database = firebase.database();

        let allContent = [];
        let userFavorites = [];
        let userProgress = {};
        let userHistory = [];

        // ==================== VERIFICAR AUTENTICACIÓN ====================
        auth.onAuthStateChanged(function(user) {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            loadAllData();
            setupTabs();
        });

        function loadAllData() {
            const user = auth.currentUser;
            if (!user) return;

            // Contenido
            database.ref('content').on('value', function(snapshot) {
                const data = snapshot.val();
                allContent = [];
                if (data) {
                    Object.keys(data).forEach(key => allContent.push({ id: key, ...data[key] }));
                }
                renderAll();
            });

            // Favoritos
            database.ref(`favorites/${user.uid}`).on('value', function(snapshot) {
                const data = snapshot.val() || {};
                userFavorites = Object.keys(data);
                renderFavorites();
            });

            // Progreso
            database.ref(`progress/${user.uid}`).on('value', function(snapshot) {
                userProgress = snapshot.val() || {};
                renderContinue();
            });

            // Historial
            database.ref(`history/${user.uid}`).on('value', function(snapshot) {
                const data = snapshot.val() || {};
                userHistory = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
                renderHistory();
            });
        }

        function renderAll() {
            renderFavorites();
            renderContinue();
            renderHistory();
        }

        function renderFavorites() {
            const container = document.getElementById('favoritesGrid');
            const items = allContent.filter(item => userFavorites.includes(item.id));

            if (items.length === 0) {
                container.innerHTML = `<div class="empty-state-premium"><div class="empty-icon">❤️</div><h3>Sin favoritos</h3><p>Agrega contenido a tu lista</p></div>`;
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="content-card" onclick="window.location.href='reproductor.html?id=${item.id}&type=${item.type}'">
                    <div class="card-image">
                        <img src="${item.poster}" alt="${item.title}" loading="lazy">
                        <div class="card-overlay">
                            <button class="play-btn-small"><span class="material-icons">play_arrow</span></button>
                        </div>
                    </div>
                    <div class="card-info">
                        <h4>${item.title}</h4>
                        <span class="card-year">${item.year || 'N/A'}</span>
                    </div>
                </div>
            `).join('');
        }

        function renderContinue() {
            const container = document.getElementById('continueGrid');
            const items = allContent.filter(item => {
                const p = userProgress[item.id];
                return p && p.episode > 0 && p.episode < p.total;
            });

            if (items.length === 0) {
                container.innerHTML = `<div class="empty-state-premium"><div class="empty-icon">▶️</div><h3>Sin contenido en progreso</h3></div>`;
                return;
            }

            container.innerHTML = items.map(item => {
                const p = userProgress[item.id];
                const percent = p.total > 0 ? (p.episode / p.total) * 100 : 0;
                return `
                    <div class="content-card" onclick="window.location.href='reproductor.html?id=${item.id}&type=${item.type}'">
                        <div class="card-image">
                            <img src="${item.poster}" alt="${item.title}" loading="lazy">
                            <div class="card-progress-bar" style="width: ${percent}%"></div>
                            <div class="card-overlay">
                                <button class="play-btn-small"><span class="material-icons">play_arrow</span></button>
                            </div>
                        </div>
                        <div class="card-info">
                            <h4>${item.title}</h4>
                            <span class="card-progress-text">${p.episode || 0}/${p.total || 0} capítulos</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderHistory() {
            const container = document.getElementById('historyList');
            if (userHistory.length === 0) {
                container.innerHTML = `<div class="empty-state-premium"><div class="empty-icon">📜</div><h3>Sin historial</h3></div>`;
                return;
            }

            container.innerHTML = userHistory.slice(0, 20).map(entry => {
                const item = allContent.find(c => c.id === entry.id);
                if (!item) return '';
                const date = new Date(entry.timestamp);
                return `
                    <div class="history-item" onclick="window.location.href='reproductor.html?id=${item.id}&type=${item.type}'">
                        <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/40x60/1A1A1A/ffffff?text=No'">
                        <div class="history-info">
                            <h4>${item.title}</h4>
                            <span class="history-type">${item.type === 'pelicula' ? '🎬 Película' : '📺 Serie'}</span>
                            <span class="history-time">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
                        </div>
                        <span class="material-icons">chevron_right</span>
                    </div>
                `;
            }).join('');
        }

        function setupTabs() {
            document.querySelectorAll('.lista-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.lista-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.lista-section').forEach(s => s.classList.remove('active'));
                    this.classList.add('active');
                    document.getElementById('section-' + this.dataset.tab).classList.add('active');
                });
            });
        }
    </script>
</body>
</html>
