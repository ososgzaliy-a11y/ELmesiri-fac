/**
 * =========================================================================
 * Al-Mesiri E-Commerce - Firebase Cloud Database Integration Layer
 * Connects store orders, customers, and RFQs directly to Google Firebase Cloud
 * =========================================================================
 */

const FIREBASE_CONFIG = {
    apiKey: localStorage.getItem('mesiri_fb_apikey') || "",
    authDomain: localStorage.getItem('mesiri_fb_authdomain') || "",
    projectId: localStorage.getItem('mesiri_fb_projectid') || "",
    storageBucket: localStorage.getItem('mesiri_fb_storagebucket') || "",
    messagingSenderId: localStorage.getItem('mesiri_fb_senderid') || "",
    appId: localStorage.getItem('mesiri_fb_appid') || "",
    databaseURL: localStorage.getItem('mesiri_fb_dburl') || ""
};

class FirebaseSyncManager {
    constructor() {
        this.isConfigured = !!(FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.databaseURL);
    }

    /**
     * Save an order to Firebase Realtime Database or Cloud Firestore via REST API
     */
    async syncOrderToFirebase(order) {
        if (!this.isConfigured) {
            console.log('[Firebase] Notice: Firebase credentials not configured yet. Saving to local database.');
            return false;
        }

        try {
            // 1. If Firebase Realtime Database URL is provided
            if (FIREBASE_CONFIG.databaseURL) {
                const url = `${FIREBASE_CONFIG.databaseURL.replace(/\/$/, '')}/orders/${order.id}.json`;
                await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });
                console.log(`[Firebase] ✅ Order #${order.id} successfully synced to Firebase Realtime Database!`);
                return true;
            }

            // 2. If Cloud Firestore Project ID is provided
            if (FIREBASE_CONFIG.projectId) {
                const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/orders/${order.id}`;
                
                // Convert JS Object to Firestore Document Format
                const fields = this.convertToFirestoreFields(order);
                await fetch(firestoreUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fields })
                });
                console.log(`[Firebase] ✅ Order #${order.id} successfully synced to Cloud Firestore!`);
                return true;
            }
        } catch (error) {
            console.warn('[Firebase] Warning: Failed to sync with Firebase Cloud:', error);
            return false;
        }
    }

    /**
     * Convert JavaScript JSON to Firestore REST API fields structure
     */
    convertToFirestoreFields(obj) {
        const fields = {};
        for (const [key, val] of Object.entries(obj)) {
            if (val === null || val === undefined) continue;
            if (typeof val === 'string') {
                fields[key] = { stringValue: val };
            } else if (typeof val === 'number') {
                fields[key] = Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
            } else if (typeof val === 'boolean') {
                fields[key] = { booleanValue: val };
            } else if (Array.isArray(val)) {
                fields[key] = {
                    arrayValue: {
                        values: val.map(item => typeof item === 'object' ? { mapValue: { fields: this.convertToFirestoreFields(item) } } : { stringValue: String(item) })
                    }
                };
            } else if (typeof val === 'object') {
                fields[key] = { mapValue: { fields: this.convertToFirestoreFields(val) } };
            }
        }
        return fields;
    }

    /**
     * Save new Firebase credentials
     */
    saveConfig(config) {
        if (config.apiKey) localStorage.setItem('mesiri_fb_apikey', config.apiKey);
        if (config.projectId) localStorage.setItem('mesiri_fb_projectid', config.projectId);
        if (config.databaseURL) localStorage.setItem('mesiri_fb_dburl', config.databaseURL);
        this.isConfigured = true;
    }
}

window.FirebaseManager = new FirebaseSyncManager();
