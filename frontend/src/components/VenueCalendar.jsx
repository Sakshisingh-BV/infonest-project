import { useState, useEffect } from 'react';
import { venueAPI } from '../services/api';

const VenueCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // 'month' or 'week'

  // Get current month/year
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch bookings when month changes
  useEffect(() => {
    fetchBookings();
  }, [year, month]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Get first and last day of current month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      const res = await venueAPI.getBookingsByDateRange(startDate, endDate);
      setBookings(res.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    }
    setLoading(false);
  };

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfWeek = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Format date to string
  const formatDateStr = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Get bookings for a specific date
  const getBookingsForDate = (dateStr) => {
    return bookings.filter(booking => {
      const bookingDate = booking.bookingDate;
      return bookingDate === dateStr;
    });
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const days = [];

    // Empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(year, month, day);
      const dayBookings = getBookingsForDate(dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = selectedDate === dateStr;
      const isPast = dateStr < new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''} ${dayBookings.length > 0 ? 'has-bookings' : ''}`}
          onClick={() => onDateSelect && onDateSelect(dateStr)}
        >
          <span className="day-number">{day}</span>
          {dayBookings.length > 0 && (
            <div className="booking-indicators">
              {dayBookings.slice(0, 3).map((booking, idx) => (
                <div
                  key={idx}
                  className="booking-dot"
                  title={`${booking.venue?.name || 'Venue'}: ${booking.eventName || booking.purpose}`}
                >
                  {booking.venue?.name?.substring(0, 2) || 'V'}
                </div>
              ))}
              {dayBookings.length > 3 && (
                <span className="more-bookings">+{dayBookings.length - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="venue-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
          ◀
        </button>
        <h3 className="calendar-title">
          {monthNames[month]} {year}
        </h3>
        <button className="calendar-nav-btn" onClick={goToNextMonth}>
          ▶
        </button>
        <button className="today-btn" onClick={goToToday}>
          Today
        </button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {loading ? (
          <div className="calendar-loading">Loading bookings...</div>
        ) : (
          renderCalendarDays()
        )}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot booked"></span>
          <span>Has Bookings</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot today"></span>
          <span>Today</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="selected-date-details">
          <h4>Bookings for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}</h4>
          {getBookingsForDate(selectedDate).length > 0 ? (
            <div className="bookings-list">
              {getBookingsForDate(selectedDate).map(booking => (
                <div key={booking.bookingId} className="booking-item">
                  <div className="booking-time">
                    {booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)}
                  </div>
                  <div className="booking-info">
                    <strong>{booking.venue?.name || 'Venue'}</strong>
                    <span>{booking.eventName || booking.purpose}</span>
                    <span className="booking-by">By: {booking.bookedByName || booking.bookedByEmail}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-bookings">No bookings for this date</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueCalendar;

