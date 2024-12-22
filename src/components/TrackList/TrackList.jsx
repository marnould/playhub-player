import React, { useState, useEffect } from 'react';
import { getTracks } from '../../services/api';
import './styles.css';

const PlayIcon = () => <span className="player-icon">▶</span>;
const PauseIcon = () => <span className="player-icon">⏸</span>;

const TrackList = ({ onPlayTrack }) => {
    // Initialize tracks as an empty array instead of null/undefined
    const [tracks, setTracks] = useState([]);
    const [currentTrackId, setCurrentTrackId] = useState(null);
    // Add loading and error states to handle different data states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTracks = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const tracksData = await getTracks();
                // Make sure we have an array before setting the state
                if (Array.isArray(tracksData)) {
                    setTracks(tracksData);
                } else {
                    // If the API returns an object instead of an array,
                    // check if the data might be nested
                    if (tracksData && typeof tracksData === 'object') {
                        const possibleTracks = Object.values(tracksData);
                        if (Array.isArray(possibleTracks)) {
                            setTracks(possibleTracks);
                        } else {
                            throw new Error('Received data is not in the expected format');
                        }
                    } else {
                        throw new Error('Received data is not in the expected format');
                    }
                }
            } catch (error) {
                console.error('Failed to load tracks:', error);
                setError('Failed to load tracks. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadTracks();
    }, []);

    const handlePlayClick = (track) => {
        const newTrackId = currentTrackId === track.id ? null : track.id;
        setCurrentTrackId(newTrackId);

        if (onPlayTrack) {
            onPlayTrack(newTrackId ? track : null);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="track-list-container">
                <div className="track-list-message">Loading tracks...</div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="track-list-container">
                <div className="track-list-message error">{error}</div>
            </div>
        );
    }

    // Show empty state
    if (!tracks || tracks.length === 0) {
        return (
            <div className="track-list-container">
                <div className="track-list-message">No tracks available</div>
            </div>
        );
    }

    return (
        <div className="track-list-container">
            <h2 className="track-list-title">Tracks</h2>
            <div className="track-list">
                {tracks.map(track => (
                    <div
                        key={track.id}
                        className={`track-item ${currentTrackId === track.id ? 'current-track' : ''}`}
                    >
                        <div className="track-info">
                            <div className="track-title">{track.title}</div>
                            <div className="track-artist">Artist Name</div>
                            <div className="track-details">
                                <div className="track-album">{track.album.title}</div>
                                <div className="track-platform">
                                    {track.sourcePlatform}
                                </div>
                            </div>
                        </div>
                        <button
                            className="play-button"
                            onClick={() => handlePlayClick(track)}
                        >
                            {currentTrackId === track.id ? <PauseIcon /> : <PlayIcon />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrackList;