// ==================== BASE DE DATOS ====================

// ===== GUARDAR PROGRESO =====
async function saveProgress(userId, contentId, data) {
    try {
        await database.ref(`progress/${userId}/${contentId}`).update({
            ...data,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving progress:', error);
        return { success: false, error: error.message };
    }
}

// ===== OBTENER PROGRESO =====
async function getProgress(userId, contentId) {
    try {
        const snapshot = await database.ref(`progress/${userId}/${contentId}`).once('value');
        return snapshot.val() || null;
    } catch (error) {
        console.error('Error getting progress:', error);
        return null;
    }
}

// ===== OBTENER TODO EL PROGRESO =====
async function getAllProgress(userId) {
    try {
        const snapshot = await database.ref(`progress/${userId}`).once('value');
        return snapshot.val() || {};
    } catch (error) {
        console.error('Error getting all progress:', error);
        return {};
    }
}

// ===== GUARDAR FAVORITO =====
async function toggleFavorite(userId, contentId) {
    try {
        const snapshot = await database.ref(`favorites/${userId}/${contentId}`).once('value');
        const exists = snapshot.exists();
        
        if (exists) {
            await database.ref(`favorites/${userId}/${contentId}`).remove();
            return { success: true, added: false };
        } else {
            await database.ref(`favorites/${userId}/${contentId}`).set(true);
            return { success: true, added: true };
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        return { success: false, error: error.message };
    }
}

// ===== OBTENER FAVORITOS =====
async function getFavorites(userId) {
    try {
        const snapshot = await database.ref(`favorites/${userId}`).once('value');
        const data = snapshot.val() || {};
        return Object.keys(data);
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
}

// ===== GUARDAR HISTORIAL =====
async function saveToHistory(userId, contentId, type) {
    try {
        await database.ref(`history/${userId}/${contentId}`).set({
            id: contentId,
            type: type,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving history:', error);
        return { success: false, error: error.message };
    }
}

// ===== OBTENER HISTORIAL =====
async function getHistory(userId) {
    try {
        const snapshot = await database.ref(`history/${userId}`).once('value');
        const data = snapshot.val() || {};
        return Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
}

// ===== GUARDAR CONFIGURACIÓN =====
async function saveSettings(userId, settings) {
    try {
        await database.ref(`settings/${userId}`).update(settings);
        return { success: true };
    } catch (error) {
        console.error('Error saving settings:', error);
        return { success: false, error: error.message };
    }
}

// ===== OBTENER CONFIGURACIÓN =====
async function getSettings(userId) {
    try {
        const snapshot = await database.ref(`settings/${userId}`).once('value');
        return snapshot.val() || {};
    } catch (error) {
        console.error('Error getting settings:', error);
        return {};
    }
}

// ===== GUARDAR CONTENIDO PERSONALIZADO (ADMIN) =====
async function saveCustomContent(content) {
    try {
        const newRef = database.ref('custom_content').push();
        await newRef.set({
            ...content,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        return { success: true, id: newRef.key };
    } catch (error) {
        console.error('Error saving custom content:', error);
        return { success: false, error: error.message };
    }
}

// ===== OBTENER CONTENIDO PERSONALIZADO =====
async function getCustomContent() {
    try {
        const snapshot = await database.ref('custom_content').once('value');
        const data = snapshot.val() || {};
        return Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
    } catch (error) {
        console.error('Error getting custom content:', error);
        return [];
    }
}

// ===== ELIMINAR CONTENIDO PERSONALIZADO (ADMIN) =====
async function deleteCustomContent(contentId) {
    try {
        await database.ref(`custom_content/${contentId}`).remove();
        return { success: true };
    } catch (error) {
        console.error('Error deleting custom content:', error);
        return { success: false, error: error.message };
    }
}

// ===== ESCUCHAR CAMBIOS EN FAVORITOS =====
function listenFavorites(userId, callback) {
    database.ref(`favorites/${userId}`).on('value', (snapshot) => {
        const data = snapshot.val() || {};
        callback(Object.keys(data));
    });
}

// ===== ESCUCHAR CAMBIOS EN PROGRESO =====
function listenProgress(userId, callback) {
    database.ref(`progress/${userId}`).on('value', (snapshot) => {
        callback(snapshot.val() || {});
    });
}

// ===== ESCUCHAR CAMBIOS EN HISTORIAL =====
function listenHistory(userId, callback) {
    database.ref(`history/${userId}`).on('value', (snapshot) => {
        const data = snapshot.val() || {};
        callback(Object.values(data).sort((a, b) => b.timestamp - a.timestamp));
    });
}

console.log('✅ Base de datos cargada');
