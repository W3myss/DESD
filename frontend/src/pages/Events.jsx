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
                {filteredEvents.map((event) => (
                    <li key={event.id}>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <p>Date: {event.date}</p>
                        <p>Time: {event.time}</p>
                        <p>Type: {event.event_type}</p>
                        <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EventList;