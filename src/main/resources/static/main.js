/**
 * main.js - Central Utility for InfoNest Frontend
 * Handles: JWT Storage, Role-Based Redirects, Authenticated API Calls, and Intent Recovery.
 */

const API_BASE_URL = "/api/v1";

// 1. HELPER: Get all stored authentication data
const getAuthData = () => {
    return {
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        userId: localStorage.getItem('userId'),
        clubId: localStorage.getItem('clubId'),
        firstName: localStorage.getItem('firstName'),
        email: localStorage.getItem('email')
    };
};

// 2. SECURITY: Check if a session exists
const isAuthenticated = () => !!localStorage.getItem('token');

// 3. LOGOUT: Clear all local data and boot to login
const logout = () => {
    localStorage.clear();
    window.location.href = 'login.html';
};
const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

// 4. API UTILITY: Standardized Fetch that automatically adds the JWT Bearer Token
async function authenticatedFetch(endpoint, options = {}) {
    const { token } = getAuthData();

    // Build headers sensibly: start from options.headers (if any)
    const headers = { ...(options.headers || {}) };

    // Only set Content-Type if not provided and body is not FormData (FormData sets its own multipart boundary)
    if (!headers['Content-Type'] && !(options.body instanceof FormData) && options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    // Only add Authorization if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    // If the backend returns 401 (Unauthorized) or 403 (Forbidden), the token is likely invalid
    if (response.status === 401 || response.status === 403) {
        console.warn("Session expired or unauthorized access.");
        logout();
    }

    return response;
}

// 5. ROLE-BASED REDIRECT LOGIC
function redirectToDashboard(role) {
    switch (role) {
        case 'ADMIN':
            window.location.href = 'admin_db.html';
            break;
        case 'FACULTY':
            window.location.href = 'clubofficialdashboard.html';
            break;
        case 'STUDENT':
            window.location.href = 'student_db.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

// 6. INTENT RECOVERY: Handles "Register Now" logic after a user logs in
async function handleRegisterClick(eventId, regLink) {
    // Intent Capture
    localStorage.setItem('savedEventId', eventId);
    localStorage.setItem('savedLink', regLink);

    // Auth Check
    if (!localStorage.getItem('token')) {
        alert("Please login to register.");
        window.location.href = 'login.html';
        return;
    }

    // If already logged in, proceed
    await processRegistration();
}

// Registration process main function
// Returns true if it performed a redirect/registration action, false otherwise
async function processRegistration() {
    const eventId = localStorage.getItem('savedEventId');
    const link = localStorage.getItem('savedLink');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!eventId || !userId) return false;

    // BRANCH A: Internal Club Form - Redirect to form page
    if (link === "club_form_link") {
        // For internal form, just redirect to the form page
        // The form page will handle creating and updating the registration
        window.location.href = 'club_form.html';
        return true;
    } 
    // BRANCH B: External Link - Create registration first, then redirect
    else {
        const confirmAction = confirm("You will be redirected to an external registration form. Continue?");
        if (confirmAction) {
            try {
                // Create registration record first (formData will be blank)
                const response = await fetch('/api/v1/student/register', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': 'Bearer ' + token 
                    },
                    body: JSON.stringify({ eventId, userId })
                });

                if (response.ok) {
                    // Clear saved intent
                    localStorage.removeItem('savedEventId');
                    localStorage.removeItem('savedLink');

                    // Redirect to external link
                    window.location.href = link;
                    return true;
                } else {
                    console.error('Failed to create registration', await response.text());
                    alert("Registration failed. Please try again.");
                    return false;
                }
            } catch (err) {
                console.error("External registration error:", err);
                alert("Failed to register. Please try again.");
                return false;
            }
        } else {
            // User canceled confirm
            return false;
        }
    }
}

// 8. INTENT RECOVERY (Called after Login)
async function handleSavedIntent() {
    return await processRegistration();
}

// 9. FINAL EXPORTS
window.InfoNest = {
    logout,
    isAuthenticated,
    getAuthData,
    authenticatedFetch,
    redirectToDashboard,
    handleSavedIntent, // Used by login.js
    handleRegisterClick, // Used by dashboard buttons
    getQueryParam,
    openModal: (id) => { document.getElementById(id).style.display = 'block'; },
    closeModal: (id) => { document.getElementById(id).style.display = 'none'; }
};