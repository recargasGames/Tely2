// ==================== AUTENTICACIÓN COMPLETA ====================

// ===== ESTADO DE AUTENTICACIÓN =====
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario logueado
        document.querySelectorAll('#userInfo').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#loginBtn').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#logoutBtn').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#adminLink').forEach(el => el.classList.remove('hidden'));
        
        // Mostrar información del usuario
        document.querySelectorAll('#userPhoto, #sideUserAvatar, #profileAvatar, #profileAvatarLarge').forEach(img => {
            img.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'Usuario') + '&background=E50914&color=fff&size=100';
        });
        
        document.querySelectorAll('#userName, #sideUserName, #profileName, #profileNameLarge').forEach(span => {
            span.textContent = user.displayName || 'Usuario';
        });
        
        document.querySelectorAll('#profileEmail').forEach(span => {
            span.textContent = user.email || 'email@ejemplo.com';
        });
        
        // Badge premium (simulado)
        document.querySelectorAll('.side-user-badge, .profile-badge.premium').forEach(el => {
            el.textContent = '⭐ Miembro Premium';
        });
        
    } else {
        // Usuario no logueado
        document.querySelectorAll('#userInfo').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#loginBtn').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#logoutBtn').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#adminLink').forEach(el => el.classList.add('hidden'));
    }
});

// ===== LOGIN CON EMAIL =====
async function loginWithEmail(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== LOGIN CON GOOGLE =====
async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== REGISTRO =====
async function registerUser(name, email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: name
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== RECUPERAR CONTRASEÑA =====
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== CERRAR SESIÓN =====
async function logoutUser() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== EVENTOS DE LOGIN/REGISTRO =====

// Login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = await loginWithEmail(email, password);
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                alert('❌ Error: ' + result.error);
            }
        });
    }
    
    // Google Login
    const googleLogin = document.getElementById('googleLogin');
    if (googleLogin) {
        googleLogin.addEventListener('click', async () => {
            const result = await loginWithGoogle();
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                alert('❌ Error con Google: ' + result.error);
            }
        });
    }
    
    // Registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirm = document.getElementById('registerConfirm').value;
            
            if (password !== confirm) {
                alert('❌ Las contraseñas no coinciden');
                return;
            }
            
            if (password.length < 6) {
                alert('❌ La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            const result = await registerUser(name, email, password);
            if (result.success) {
                alert('✅ Registro exitoso! Bienvenido ' + name);
                window.location.href = 'index.html';
            } else {
                alert('❌ Error: ' + result.error);
            }
        });
    }
    
    // Google Register
    const googleRegister = document.getElementById('googleRegister');
    if (googleRegister) {
        googleRegister.addEventListener('click', async () => {
            const result = await loginWithGoogle();
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                alert('❌ Error con Google: ' + result.error);
            }
        });
    }
    
    // Recuperar contraseña
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            
            const result = await resetPassword(email);
            if (result.success) {
                alert('✅ Enlace enviado a tu correo');
                window.location.href = 'login.html';
            } else {
                alert('❌ Error: ' + result.error);
            }
        });
    }
    
    // Logout
    document.querySelectorAll('#logoutBtn, #logoutSide, #profileLogout').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', async () => {
                if (confirm('¿Seguro que quieres cerrar sesión?')) {
                    const result = await logoutUser();
                    if (result.success) {
                        window.location.href = 'login.html';
                    } else {
                        alert('❌ Error: ' + result.error);
                    }
                }
            });
        }
    });
});

console.log('✅ Sistema de autenticación cargado');
