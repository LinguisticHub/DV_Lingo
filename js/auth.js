/**
 * DV Lingo - Global Google Authentication
 * Handles GIS Login, Session Persistence, and UI Updates
 */

const GOOGLE_CLIENT_ID = "304890634707-otis8fk3c7oqc2480c3s41vbai5ibfpm.apps.googleusercontent.com";

// Initialize Authentication on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    // 1. Check for stored session
    const storedUser = localStorage.getItem('dv_user');
    if (storedUser) {
        updateUI(JSON.parse(storedUser));
    }

    // 2. Initialize GIS
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });
        
        // Render button if container exists
        renderLoginButton();
    } else {
        // Fallback for script loading delay
        setTimeout(initAuth, 500);
    }
}

function renderLoginButton() {
    const container = document.getElementById("google-login-container");
    if (container && !localStorage.getItem('dv_user')) {
        google.accounts.id.renderButton(
            container,
            { theme: "outline", size: "medium", text: "signin_with", shape: "pill" }
        );
    }
}

function handleCredentialResponse(response) {
    try {
        // Decode JWT
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const user = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            firstName: payload.given_name
        };

        // Persist session
        localStorage.setItem('dv_user', JSON.stringify(user));
        
        // Update UI
        updateUI(user);

        // Auto-fill forms if on booking page
        if (window.location.pathname.includes('book-class.html')) {
            autoFillBookingForm(user);
        }
    } catch (e) {
        console.error("Auth Error:", e);
    }
}

function updateUI(user) {
    const container = document.getElementById("auth-header-wrapper");
    if (!container) return;

    if (user) {
        container.innerHTML = `
            <div class="user-profile-header" style="display: flex; align-items: center; gap: 10px; color: white;">
                <img src="${user.picture}" alt="${user.name}" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3);">
                <span class="d-none d-sm-inline-block" style="font-size: 14px; font-weight: 500;">Hi, ${user.firstName}!</span>
                <a href="#" onclick="logout(); return false;" style="color: white; font-size: 11px; text-decoration: underline; margin-left: 5px; opacity: 0.8;">Logout</a>
            </div>
        `;
    } else {
        container.innerHTML = `<div id="google-login-container"></div>`;
        renderLoginButton();
    }
}

function logout() {
    localStorage.removeItem('dv_user');
    updateUI(null);
    window.location.reload();
}

function autoFillBookingForm(user) {
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    
    // Trigger validation
    const event = new Event('input', { bubbles: true });
    if (nameInput) nameInput.dispatchEvent(event);
    if (emailInput) emailInput.dispatchEvent(event);
}
