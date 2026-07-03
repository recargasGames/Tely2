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

// Exportar servicios para usar en otros archivos
const auth = firebase.auth();
const database = firebase.database();
