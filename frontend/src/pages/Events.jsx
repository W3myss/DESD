import React, { useState, useEffect } from 'react';
import api from '../api';

function EventList({ communityId }) {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);

    useEffect(() => {
        // Fetch events from the API
        api.get(`/events/?community=${communityId}`).then((response) => {
            setEvents(response.data);
            setFilteredEvents(response.data); // Initialize filtered events
        });
    }, [communityId]);

    useEffect(() => {
        // Filter events based on the search term
        const filtered = events.filter((event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEvents(filtered);
    }, [searchTerm, events]);

    return (
        <div>
            <h2>Events</h2>
            <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
            />
            <ul>
                {filteredEvents.map((event) => (
                    <li key={event.id}>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <p>Date: {event.date}</p>
                        <p>Time: {event.time}</p>
                        <p>Type: {event.event_type}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EventList;