import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);

    const playTrack = (track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const playNext = () => {
        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
        if (currentIndex < queue.length - 1) {
            setCurrentTrack(queue[currentIndex + 1]);
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            queue,
            playTrack,
            playNext,
            setQueue,
            setIsPlaying
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);