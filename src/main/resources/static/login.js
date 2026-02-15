// login.js - single, canonical login handler

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    // Email domain validation
    function validateEmailDomain(email) {
        const lowerEmail = email.toLowerCase();
        return lowerEmail.endsWith('@banasthali.in') || lowerEmail.endsWith('@gmail.com');
    }

    // Show/hide email error on blur
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value;
        if (email.includes('@') && !validateEmailDomain(email)) {
            emailError.classList.add('show');
        } else {
            emailError.classList.remove('show');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = document.getElementById('password').value;

        // Validate email domain before sending
        if (!validateEmailDomain(email)) {
            emailError.classList.add('show');
            alert('Only @banasthali.in or @gmail.com emails are allowed!');
            return;
        }
        emailError.classList.remove('show');

        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();

                // Save auth data
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('firstName', data.firstName || '');
                localStorage.setItem('email', data.email || '');
                if (data.clubId) {
                    localStorage.setItem('clubId', data.clubId);
                }

                // Check if user was trying to register for an event before login
                const savedEventId = localStorage.getItem('savedEventId');
                if (savedEventId) {
                    const redirected = await window.InfoNest.handleSavedIntent();
                    if (!redirected) {
                        window.InfoNest.redirectToDashboard(data.role);
                    }
                } else {
                    window.InfoNest.redirectToDashboard(data.role);
                }
            } else {
                const error = await response.text();
                
                // Check for specific error messages from backend
                if (error.includes('not registered') || error.includes('sign up first')) {
                    if (confirm('You are a new user! Would you like to sign up?')) {
                        window.location.href = 'signup.html';
                    }
                } else if (error.includes('Incorrect password')) {
                    alert('Incorrect password. Please try again.');
                } else if (error.includes('Only @')) {
                    alert(error);
                } else {
                    alert("Login Failed: " + error);
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Something went wrong. Please try again.");
        }
    });
});