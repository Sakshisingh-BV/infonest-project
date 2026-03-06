import { useState, useEffect } from 'react';
import { venueAPI } from '../services/api';
import './MyBookingsCalendar.css';

const MyBookingsCalendar = ({ onBookingSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchBookings();
  }, [year, month]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Use simple date string formatting to avoid timezone issues
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      
      console.log('Fetching bookings for:', startDate, 'to', endDate);
      
      const res = await venueAPI.getBookingsByDateRange(startDate, endDate);
      console.log('Bookings fetched:', res.data);
      setBookings(res.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    }
    setLoading(false);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateStr = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Helper to convert any date format to string for comparison
  const normalizeDate = (dateValue) => {
    if (!dateValue) return '';
    
    // If it's already a string (e.g., "2026-03-07")
    if (typeof dateValue === 'string') {
      return dateValue.substring(0, 10);
    }
    
    // Handle LocalDate object from Java (has year, monthValue, dayOfMonth)
    if (typeof dateValue === 'object') {
      if (dateValue.year && dateValue.monthValue) {
        return `${dateValue.year}-${String(dateValue.monthValue).padStart(2, '0')}-${String(dateValue.dayOfMonth).padStart(2, '0')}`;
      }
      // Handle regular Date object
      if (dateValue.getFullYear) {
        return `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}-${String(dateValue.getDate()).padStart(2, '0')}`;
      }
    }
    
    return String(dateValue).substring(0, 10);
  };

  const getBookingsForDate = (dateStr) => {
    return bookings.filter(booking => {
      const bookingDate = normalizeDate(booking.bookingDate);
      return bookingDate === dateStr;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (dateStr, dayBookings) => {
    setSelectedDate(dateStr);
    if (onBookingSelect) {
      onBookingSelect(dateStr, dayBookings);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const days = [];
    // Use local date formatting for today
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(year, month, day);
      const dayBookings = getBookingsForDate(dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = selectedDate === dateStr;
      const isPast = dateStr < todayStr;
      const hasBookings = dayBookings.length > 0;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''} ${hasBookings ? 'booked' : ''}`}
          onClick={() => !isPast && handleDateClick(dateStr, dayBookings)}
        >
          <span className="day-number">{day}</span>
          {hasBookings && (
            <div className="booking-indicators">
              {dayBookings.slice(0, 3).map((booking, idx) => (
                <div key={idx} className="booking-dot" title={`${booking.venue?.name}: ${booking.eventName || booking.purpose}`}></div>
              ))}
              {dayBookings.length > 3 && <span className="more-bookings">+{dayBookings.length - 3}</span>}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="my-bookings-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={goToPreviousMonth}>◀</button>
        <h3 className="calendar-title">{monthNames[month]} {year}</h3>
        <button className="calendar-nav-btn" onClick={goToNextMonth}>▶</button>
        <button className="today-btn" onClick={goToToday}>Today</button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map(day => <div key={day} className="weekday">{day}</div>)}
      </div>

      <div className="calendar-grid">
        {loading ? (
          <div className="calendar-loading">Loading bookings...</div>
        ) : (
          renderCalendarDays()
        )}
      </div>

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

export default MyBookingsCalendar;

