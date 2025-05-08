import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from "../components/Navbar";

function EventList() {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        event_type: 'in_person', // Default value
    });
    

    useEffect(() => {
        // Fetch events from the API
        api.get('/api/events/').then((response) => {
            setEvents(response.data);
            setFilteredEvents(response.data); // Initialize filtered events
        });
    }, []);

    useEffect(() => {
        // Filter events based on the search term
        const filtered = events.filter((event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEvents(filtered);
    }, [searchTerm, events]);

    const handleCreateEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time) {
            alert("All fields are required.");
            return;
        }
        api.post('/api/events/', newEvent)
            .then((response) => {
                setEvents((prev) => [response.data, ...prev]);
                setFilteredEvents((prev) => [response.data, ...prev]);
                setShowCreateForm(false);
                setNewEvent({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    event_type: 'in_person',
                });
            })
            .catch((err) => {
                console.error('Error creating event:', err);
            });
    };

    const handleDeleteEvent = (eventId) => {
        api.delete(`/api/events/${eventId}/`)
            .then(() => {
                setEvents((prev) => prev.filter((event) => event.id !== eventId));
                setFilteredEvents((prev) => prev.filter((event) => event.id !== eventId));
            })
            .catch((err) => {
                console.error('Error deleting event:', err);
            });
    };

    const handleSignup = (eventId) => {
        api.post('/api/events/signup/', { event: eventId })
          .then(() => {
            alert("You successfully signed up!");
            // Optional: refresh signups count if displayed
          })
          .catch(err => {
            console.error("Signup failed:", err.response?.data || err);
            alert(err.response?.data?.detail || "Could not sign up.");
          });
      };

    return (
        <div>
            <Navbar />
            <h2>Events</h2>
            <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
            />
            <button onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? 'Cancel' : 'Create New Event'}
            </button>
            {showCreateForm && (
                <form onSubmit={handleCreateEvent} style={{ marginTop: '20px' }}>
                    <div>
                        <label>Title:</label>
                        <input
                            type="text"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Date:</label>
                        <input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Time:</label>
                        <input
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Event Type:</label>
                        <select
                            value={newEvent.event_type}
                            onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                        >
                            <option value="in_person">In-Person</option>
                            <option value="virtual">Virtual</option>
                        </select>
                    </div>
                    <button type="submit">Create Event</button>
                </form>
            )}
            <ul>
                {filteredEvents.map((event) => {
                    const userSignedUp = event.signups?.some(signup => signup.user === currentUser.username); // or `.id` if using IDs

                return (
                    <li key={event.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
                        <h3>{event.title}</h3>
                        <p><strong>Description:</strong> {event.description}</p>
                        <p><strong>Date:</strong> {event.date}</p>
                        <p><strong>Time:</strong> {event.time}</p>
                        <p><strong>Type:</strong> {event.event_type === 'virtual' ? 'Virtual' : 'In-Person'}</p>

                        {event.community && <p><strong>Community:</strong> {event.community}</p>}
                        {event.max_capacity && <p><strong>Max Capacity:</strong> {event.max_capacity}</p>}
                        {event.required_materials && <p><strong>Required Materials:</strong> {event.required_materials}</p>}
                        {event.location && <p><strong>Location:</strong> {event.location}</p>}
                        {event.virtual_link && (
                        <p>
                            <strong>Virtual Link:</strong>{' '}
                            <a href={event.virtual_link} target="_blank" rel="noreferrer">
                                {event.virtual_link}
                            </a>
                        </p>
                        )}
                    <p><strong>Signed Up:</strong> {event.signup_count} / {event.max_capacity || "∞"}</p>

                    {event.user_role === 'member' || event.user_role === 'moderator' || event.user_role === 'admin' ? (
                        userSignedUp ? (
                            <button disabled>✅ Joined!</button>
                        ) : (
                            <button onClick={() => handleSignup(event.id)}>Join Event</button>
                        )
                    ) : (
                        <p>You must join the community to participate.</p>
                    )}

        {event.user_role === 'admin' || event.user_role === 'moderator' || event.is_global_admin ? (
          <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
        ) : null}
      </li>
    );
  })}
</ul>
        </div>
    );
}

export default EventList;