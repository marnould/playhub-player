import React, { useState, useEffect } from 'react';
import { getTracks } from '../../services/api';
import './styles.css';
import {usePlayer} from "../../contexts/PlayerContext";
import player from "../Player/Player";

const PlayIcon = () => <span className="player-icon">▶</span>;
const PauseIcon = () => <span className="player-icon">⏸</span>;

const TrackList = ({ onPlayTrack }) => {
    // Initialize tracks as an empty array instead of null/undefined
    const [currentTrackId, currentTrack, setCurrentTrack] = useState(null);
    const { playTrack, queue, setQueue, addToQueue } = usePlayer();
    const [tracks, setTracks] = useState([]);
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

    // const handlePlayClick = (track) => {
    //     // Met à jour le morceau actuel et joue-le
    //     playTrack(track.id, player.deviceId);
    //
    //     // Ajouter le morceau à la file d'attente si ce n'est pas déjà le cas
    //     if (!queue.find(t => t.id === track.id)) {
    //         setQueue([...queue, track]);
    //     }
    // };

    const handlePlayClick = (track) => {
        // Add the track to the queue if it's not already there
        addToQueue(track);

        // If no track is currently playing, set this as the current track
        if (!currentTrack) {
            setCurrentTrack(track);
        }

        // Play the track
        playTrack(track.id);
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
                            <div className="track-artist">
                                {track.artists.map((artist, index) => (
                                    <span key={artist.id}>
                                        {artist.name}
                                        {index < track.artists.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
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
                            {currentTrackId === track.id ? <PauseIcon/> : <PlayIcon/>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrackList;