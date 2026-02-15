document.addEventListener('DOMContentLoaded', async () => {
    const auth = window.InfoNest.getAuthData();
    document.getElementById('studentName').innerText = auth.firstName || "Student";

    if (!auth.userId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch all registrations for this student
        // Use endpoint relative to API base; `authenticatedFetch` already prefixes `/api/v1`
        const response = await window.InfoNest.authenticatedFetch(`/student/my-registrations/${auth.userId}`);
        const registrations = await response.json();

        const tbody = document.getElementById('registrationBody');
        tbody.innerHTML = '';

        if (registrations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No registrations found.</td></tr>';
            return;
        }

        registrations.forEach(reg => {
            const row = `
                <tr>
                    <td>Event #${reg.eventId}</td>
                    <td>${new Date(reg.submissionDate).toLocaleString()}</td>
                    <td><span class="status-badge">${reg.status}</span></td>
                    <td>
                        <button onclick='viewDetails(${JSON.stringify(reg)})'>View Details</button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    } catch (err) {
        console.error("Error loading dashboard:", err);
    }
});

// Function to handle the View Details Popup
function viewDetails(reg) {
    const modal = document.getElementById('detailsModal');
    const modalData = document.getElementById('modalData');
    modalData.innerHTML = '';

    if (!reg.formData) {
        modalData.innerHTML = "<p><strong>Registration Type:</strong> External Link (Branch B)</p><p>No additional form data available.</p>";
    } else {
        try {
            // Parse the JSON string stored in formData
            const data = JSON.parse(reg.formData);
            let html = "<p><strong>Internal Form Data:</strong></p><ul>";
            
            // Loop through JSON keys (Name, Age, Resume Link etc.)
            for (const [key, value] of Object.entries(data)) {
                html += `<li><strong>${key}:</strong> ${value}</li>`;
            }
            html += "</ul>";
            modalData.innerHTML = html;
        } catch (e) {
            modalData.innerHTML = "<p>Error parsing form data.</p>";
        }
    }
    modal.style.display = "block";
}

function closeModal() {
    document.getElementById('detailsModal').style.display = "none";
}

// Close modal if user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target == modal) closeModal();
}