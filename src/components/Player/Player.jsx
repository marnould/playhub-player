import React, { useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { getSpotifyToken, playTrack } from '../../services/api';
import { Play, Pause } from 'lucide-react';

const Player = () => {
    const { currentTrack, isPlaying, setIsPlaying, playNext } = usePlayer();
    const [player, setPlayer] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'Web Player',
                getOAuthToken: cb => {
                    getSpotifyToken().then(response => cb(response.data.token));
                }
            });

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setPlayer(spotifyPlayer);
            });

            spotifyPlayer.addListener('player_state_changed', state => {
                if (!state) return;
                setIsPlaying(!state.paused);

                if (state.position === 0 && state.paused) {
                    playNext();
                }
            });

            spotifyPlayer.connect();
        };
    }, []);

    useEffect(() => {
        if (currentTrack && player) {
            playTrack(`spotify:track:${currentTrack.spotifyId}`);
        }
    }, [currentTrack, player]);

    const togglePlay = () => {
        if (player) {
            player.togglePlay();
        }
    };

    if (!currentTrack) return null;

    return (
        <div className="p-4">
            <div className="flex flex-col gap-4">
                <img
                    src={currentTrack.albumArt}
                    alt={currentTrack.title}
                    className="w-full rounded-lg"
                />
                <div className="text-center">
                    <h2 className="font-bold">{currentTrack.title}</h2>
                    <p className="text-gray-500">{currentTrack.artist}</p>
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={togglePlay}
                        className="p-4 rounded-full bg-green-500 text-white"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Player;