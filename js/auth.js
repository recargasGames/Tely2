// ==================== AUTENTICACIÓN ====================

// Estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario logueado
        document.querySelectorAll('#userInfo').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#loginBtn').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#logoutBtn').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#adminLink').forEach(el => el.classList.remove('hidden'));
        
        // Mostrar información del usuario
        document.querySelectorAll('#userPhoto').forEach(img => {
            img.src = user.photoURL || 'https://via.placeholder.com/35/1a1a2e/ffffff?text=U';
        });
        document.querySelectorAll('#userName').forEach(span => {
            span.textContent = user.displayName || 'Usuario';
        });
    } else {
        // Usuario no logueado
        document.querySelectorAll('#userInfo').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#loginBtn').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#logoutBtn').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#adminLink').forEach(el => el.classList.add('hidden'));
    }
});

// Cerrar sesión
document.querySelectorAll('#logoutBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        }).catch(error => {
            alert('Error al cerrar sesión: ' + error.message);
        });
    });
});
