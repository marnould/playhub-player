import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const Player = () => {
    const {
        currentTrack,
        isPlaying,
        setIsPlaying,
        playTrack,
        pauseTrack,
        setCurrentTrack,
        queue
    } = usePlayer();
    const [loading, setLoading] = useState(false);

    // Add effect to handle track changes
    useEffect(() => {
        if (currentTrack && !isPlaying) {
            playTrack(currentTrack.id);
        }
    }, [currentTrack]); // Only depend on currentTrack changes

    const togglePlay = async () => {
        setLoading(true);
        try {
            if (isPlaying) {
                await pauseTrack();
                setIsPlaying(false);
            } else if (currentTrack) {
                await playTrack(currentTrack.id);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error controlling the player:', error);
        } finally {
            setLoading(false);
        }
    };

    const playNext = async () => {
        const currentIndex = queue.findIndex(track => track.id === currentTrack?.id);
        const nextTrack = queue[currentIndex + 1];

        if (nextTrack) {
            setLoading(true);
            try {
                setCurrentTrack(nextTrack);
                await playTrack(nextTrack.id);
            } catch (error) {
                console.error('Error playing next track:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const playPrev = async () => {
        const currentIndex = queue.findIndex(track => track.id === currentTrack?.id);
        const prevTrack = queue[currentIndex - 1];

        if (prevTrack) {
            setLoading(true);
            try {
                setCurrentTrack(prevTrack);
                await playTrack(prevTrack.id);
            } catch (error) {
                console.error('Error playing previous track:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!currentTrack) return null;

    return (
        <div className="player-container">
            <div className="player-controls">
                <button
                    onClick={playPrev}
                    className="control-btn prev-btn"
                    disabled={loading || !queue[queue.indexOf(currentTrack) - 1]}
                >
                    <SkipBack size={24}/>
                </button>

                <button
                    onClick={togglePlay}
                    className="control-btn play-btn"
                    disabled={loading}
                >
                    {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                </button>

                <button
                    onClick={playNext}
                    className="control-btn next-btn"
                    disabled={loading || !queue[queue.indexOf(currentTrack) + 1]}
                >
                    <SkipForward size={24}/>
                </button>
            </div>
            <div className="track-info">
                <img
                    src={currentTrack.album}
                    alt={currentTrack.title}
                    className="track-img"
                />
                <div className="track-details">
                    <h2 className="track-title">{currentTrack.title}</h2>
                    <p className="track-artist">{currentTrack.artist}</p>
                </div>
            </div>
        </div>
    );
};

export default Player;