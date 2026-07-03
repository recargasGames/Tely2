// ==================== CONFIGURACIÓN DE FIREBASE ====================
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

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Crear variables globales para usar en toda la aplicación
const auth = firebase.auth();
const database = firebase.database();

// También exponerlas como variables globales (window)
window.auth = auth;
window.database = database;
