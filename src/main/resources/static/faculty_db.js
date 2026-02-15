/**
 * faculty_db.js - Faculty Dashboard JavaScript
 * Handles: Event management (Add, Update, Delete), Submissions management
 */

const auth = window.InfoNest.getAuthData();
const clubId = auth.clubId; // Faculty's clubId from localStorage

// Page Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Display clubId on the page
    document.getElementById('displayClubId').textContent = clubId || 'Not Assigned';
    
    // Load faculty's events on page load
    loadMyEvents();
    
    // Load faculty's own registrations
    loadMyRegistrations();
});

// ==================== MODAL FUNCTIONS ====================
function openModal(id) { 
    document.getElementById(id).style.display = 'block'; 
}

function closeModal(id) { 
    document.getElementById(id).style.display = 'none';
    // Reset forms when closing
    if (id === 'addEventModal') {
        document.getElementById('addEventForm').reset();
    }
    if (id === 'updateSearchModal') {
        document.getElementById('searchEventName').value = '';
        document.getElementById('editEventForm').style.display = 'none';
    }
}

// ==================== LOAD MY EVENTS ====================
async function loadMyEvents() {
    try {
        const response = await window.InfoNest.authenticatedFetch('/faculty/my-events');
        if (response.ok) {
            const events = await response.json();
            displayEvents(events);
        } else {
            console.error('Failed to load events');
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function displayEvents(events) {
    const container = document.getElementById('eventsListBody');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (events.length === 0) {
        container.innerHTML = '<tr><td colspan="6">No events found for your club.</td></tr>';
        return;
    }
    
    events.forEach(event => {
        container.innerHTML += `
            <tr>
                <td>${event.eventId}</td>
                <td>${event.eventName}</td>
                <td>${event.eventDate || 'N/A'}</td>
                <td>${event.deadline || 'N/A'}</td>
                <td>${event.registrationFormLink || 'N/A'}</td>
                <td>
                    <button onclick="prepareEditEvent(${event.eventId}, '${event.eventName}')">Edit</button>
                    <button onclick="deleteEvent(${event.eventId})" style="background-color: #dc3545;">Delete</button>
                </td>
            </tr>
        `;
    });
}

// ==================== ADD EVENT ====================
document.getElementById('addEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventDate = document.getElementById('addEventDate')?.value || null;
    const deadline = document.getElementById('addDeadline')?.value || null;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Frontend validation: event_date >= today
    if (eventDate && eventDate < today) {
        alert('Error: Event date must be today or a future date!');
        return;
    }
    
    // Frontend validation: deadline < event_date
    if (deadline && eventDate && deadline >= eventDate) {
        alert('Error: Registration deadline must be before the event date!');
        return;
    }
    
    const event = {
        clubId: clubId,
        eventName: document.getElementById('addEventName').value,
        description: document.getElementById('addDescription').value || '',
        venueId: document.getElementById('addVenueId')?.value || null,
        eventDate: eventDate,
        eventTime: document.getElementById('addEventTime')?.value || null,
        deadline: deadline,
        registrationFormLink: document.getElementById('addRegLink').value || 'club_form_link'
    };
    
    try {
        const response = await window.InfoNest.authenticatedFetch('/faculty/add-event', {
            method: 'POST',
            body: JSON.stringify(event)
        });
        
        if (response.ok) {
            alert('Event added successfully!');
            closeModal('addEventModal');
            document.getElementById('addEventForm').reset();
            loadMyEvents(); // Refresh the events list
        } else {
            const error = await response.text();
            alert('Failed to add event: ' + error);
        }
    } catch (error) {
        console.error('Error adding event:', error);
        alert('Error adding event. Please try again.');
    }
});

// ==================== FETCH EVENT FOR UPDATE ====================
async function fetchEventForUpdate() {
    const eventName = document.getElementById('searchEventName').value;
    
    if (!eventName) {
        alert('Please enter an event name');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        // Using regular fetch instead of authenticatedFetch to avoid auto-logout on 403/404
        const response = await fetch(`/api/v1/faculty/event-details/${clubId}/${encodeURIComponent(eventName)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const event = await response.json();
            
            // Populate the edit form
            document.getElementById('editEventId').value = event.eventId;
            document.getElementById('editEventName').value = event.eventName;
            document.getElementById('editDescription').value = event.description || '';
            document.getElementById('editVenueId').value = event.venueId || '';
            document.getElementById('editEventDate').value = event.eventDate || '';
            document.getElementById('editEventTime').value = event.eventTime || '';
            document.getElementById('editDeadline').value = event.deadline || '';
            document.getElementById('editRegLink').value = event.registrationFormLink || '';
            
            // Show the edit form
            document.getElementById('editEventForm').style.display = 'block';
        } else {
            // Handle error without redirecting
            alert('Event not found! Please check the event name and try again.');
            document.getElementById('editEventForm').style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        alert('Error fetching event details. Please try again.');
    }
}

// Prepare edit from events list (alternative method)
async function prepareEditEvent(eventId, eventName) {
    document.getElementById('searchEventName').value = eventName;
    openModal('updateSearchModal');
    await fetchEventForUpdate();
}

// ==================== UPDATE EVENT ====================
document.getElementById('editEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventId = document.getElementById('editEventId').value;
    const eventDate = document.getElementById('editEventDate')?.value || null;
    const deadline = document.getElementById('editDeadline')?.value || null;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Frontend validation: event_date >= today
    if (eventDate && eventDate < today) {
        alert('Error: Event date must be today or a future date!');
        return;
    }
    
    // Frontend validation: deadline < event_date
    if (deadline && eventDate && deadline >= eventDate) {
        alert('Error: Registration deadline must be before the event date!');
        return;
    }
    
    const eventDetails = {
        eventName: document.getElementById('editEventName').value,
        description: document.getElementById('editDescription').value || '',
        venueId: document.getElementById('editVenueId')?.value || null,
        eventDate: eventDate,
        eventTime: document.getElementById('editEventTime')?.value || null,
        deadline: deadline,
        registrationFormLink: document.getElementById('editRegLink').value || ''
    };
    
    try {
        const response = await window.InfoNest.authenticatedFetch(`/faculty/update-event/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventDetails)
        });
        
        if (response.ok) {
            alert('Event updated successfully!');
            closeModal('updateSearchModal');
            loadMyEvents(); // Refresh the events list
        } else {
            const error = await response.text();
            alert('Failed to update event: ' + error);
        }
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Error updating event. Please try again.');
    }
});

// ==================== DELETE EVENT ====================
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await window.InfoNest.authenticatedFetch(`/faculty/delete-event/${eventId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Event deleted successfully!');
            loadMyEvents(); // Refresh the events list
        } else {
            const error = await response.text();
            alert('Failed to delete event: ' + error);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
    }
}

// ==================== SUBMISSIONS MANAGEMENT ====================
async function loadSubmissions() {
    try {
        const response = await window.InfoNest.authenticatedFetch(`/faculty/submissions/${clubId}`);
        
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('submissionBody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">No submissions found.</td></tr>';
                return;
            }

            data.forEach(reg => {
                const statusClass = `status-${reg.status.toLowerCase()}`;
                const isFinalized = reg.status === 'APPROVED' || reg.status === 'REJECTED';
                
                // If already approved/rejected, show disabled buttons with tooltip
                const actionButtons = isFinalized 
                    ? `<span style="color: var(--muted); font-size: 0.8rem;">Decision final</span>`
                    : `<button onclick="updateRegStatus(${reg.regId}, 'APPROVED')" style="background-color: #28a745;">Approve</button>
                       <button onclick="updateRegStatus(${reg.regId}, 'REJECTED')" style="background-color: #dc3545;">Reject</button>`;
                
                tbody.innerHTML += `
                    <tr>
                        <td>${reg.userId}</td>
                        <td>${reg.eventId}</td>
                        <td><pre style="max-width: 200px; overflow: auto;">${reg.formData || 'N/A'}</pre></td>
                        <td class="${statusClass}">${reg.status}</td>
                        <td>${actionButtons}</td>
                    </tr>
                `;
            });
        } else {
            const error = await response.text();
            alert('Failed to load submissions: ' + error);
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        alert('Error loading submissions. Please try again.');
    }
}

async function updateRegStatus(regId, status) {
    // Confirmation popup with warning
    const actionText = status === 'APPROVED' ? 'APPROVE' : 'REJECT';
    const confirmed = confirm(
        `⚠️ WARNING: This action CANNOT be undone!\n\n` +
        `Are you sure you want to ${actionText} this registration?\n\n` +
        `Once ${status.toLowerCase()}, you will not be able to change this decision.`
    );
    
    if (!confirmed) {
        return; // User cancelled
    }
    
    try {
        const response = await window.InfoNest.authenticatedFetch(`/faculty/update-status/${regId}?status=${status}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert(`Application ${status} successfully!`);
            loadSubmissions(); // Refresh list
        } else {
            const error = await response.text();
            alert('Failed to update status: ' + error);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}

// ==================== MY REGISTRATIONS (Faculty's own registrations) ====================
async function loadMyRegistrations() {
    const userId = auth.userId;
    if (!userId) return;

    try {
        const response = await window.InfoNest.authenticatedFetch(`/student/my-registrations/${userId}`);
        const registrations = await response.json();
        
        const tbody = document.getElementById('myRegistrationsBody');
        tbody.innerHTML = '';

        if (registrations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">You have not registered for any events yet.</td></tr>';
            return;
        }

        registrations.forEach(reg => {
            const statusClass = `status-${reg.status.toLowerCase()}`;
            const submissionDate = reg.submissionDate 
                ? new Date(reg.submissionDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : 'N/A';
            
            tbody.innerHTML += `
                <tr>
                    <td>Event #${reg.eventId}</td>
                    <td>${submissionDate}</td>
                    <td class="${statusClass}">${reg.status}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading my registrations:', error);
    }
}

// ==================== CLUB SETTINGS ====================
async function loadClubDetails() {
    try {
        const response = await window.InfoNest.authenticatedFetch('/faculty/my-club');
        if (response.ok) {
            const club = await response.json();
            document.getElementById('clubNameDisplay').value = club.clubName || '';
            document.getElementById('clubDescription').value = club.description || '';
        } else {
            console.error('Failed to load club details');
        }
    } catch (error) {
        console.error('Error loading club details:', error);
    }
}

async function updateClubDescription() {
    const description = document.getElementById('clubDescription').value;
    
    if (!description.trim()) {
        alert('Please enter a description');
        return;
    }
    
    try {
        const response = await window.InfoNest.authenticatedFetch('/faculty/update-club-description', {
            method: 'PUT',
            body: JSON.stringify({ description: description })
        });
        
        if (response.ok) {
            alert('Club description updated successfully!');
        } else {
            const error = await response.text();
            alert('Failed to update description: ' + error);
        }
    } catch (error) {
        console.error('Error updating club description:', error);
        alert('Error updating description. Please try again.');
    }
}