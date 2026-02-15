document.getElementById('customRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const auth = window.InfoNest.getAuthData();
    const eventId = localStorage.getItem('savedEventId');

    if (!auth.token || !auth.userId) {
        alert("Not logged in. Please login first.");
        window.location.href = 'login.html';
        return;
    }

    if (!eventId) {
        alert("No event selected. Please select an event first.");
        window.location.href = 'clubdashboard.html';
        return;
    }

    // 1. Collect form data
    const formData = new FormData(e.target);
    const dataObject = Object.fromEntries(formData.entries());

    try {
        // 2. Create registration record
        const registerResponse = await window.InfoNest.authenticatedFetch('/student/register', {
            method: 'POST',
            body: JSON.stringify({
                eventId: eventId,
                userId: auth.userId
            })
        });

        if (!registerResponse.ok) {
            const error = await registerResponse.text();
            if (error.includes('already registered')) {
                alert('You have already registered for this event!');
                window.location.href = 'clubdashboard.html';
                return;
            }
            alert('Registration failed: ' + error);
            return;
        }

        const regData = await registerResponse.json();
        const regId = regData.regId;

        // 3. Update with form data
        const updateResponse = await window.InfoNest.authenticatedFetch('/student/update-form-data', {
            method: 'PUT',
            body: JSON.stringify({
                regId: regId,
                formData: JSON.stringify(dataObject)
            })
        });

        if (updateResponse.ok) {
            alert("Registration Successful! Your data has been saved.");
            // Cleanup
            localStorage.removeItem('savedEventId');
            localStorage.removeItem('savedLink');
            localStorage.removeItem('currentRegId');
            // Redirect to dashboard
            window.location.href = 'student_db.html';
        } else {
            alert("Failed to save form data.");
        }
    } catch (err) {
        console.error("Form submission error:", err);
        alert("Error connecting to server. Please try again.");
    }
});