// Estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        document.querySelectorAll('#userInfo').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#loginBtn').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#logoutBtn').forEach(el => el.classList.remove('hidden'));
        
        document.querySelectorAll('#userPhoto').forEach(img => {
            img.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'Usuario') + '&background=e50914&color=fff&size=35';
        });
        document.querySelectorAll('#userName').forEach(span => {
            span.textContent = user.displayName || 'Usuario';
        });
    } else {
        document.querySelectorAll('#userInfo').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#loginBtn').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#logoutBtn').forEach(el => el.classList.add('hidden'));
    }
});

document.querySelectorAll('#logoutBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
});
