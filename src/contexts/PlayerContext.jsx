import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { pauseSpotifyTrack, playSpotifyTrack } from '../services/api';

const PlayerContext = createContext();

// Define our SDK states for better tracking
const SDK_STATES = {
    INITIAL: 'initial',
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error'
};

export function PlayerProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [player, setPlayer] = useState(null);
    const [token, setToken] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [sdkState, setSdkState] = useState(SDK_STATES.INITIAL);

    // Use refs to maintain state across re-renders
    const sdkReadyPromiseRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    // Create a promise that will resolve when the SDK is ready
    const createSDKReadyPromise = () => {
        return new Promise((resolve) => {
            // Store the resolve function, so we can call it when the SDK is ready
            sdkReadyPromiseRef.current = resolve;
        });
    };

    // Function to load the Spotify SDK script
    const loadSpotifyScript = () => {
        return new Promise((resolve, reject) => {
            // If script is already loaded, resolve immediately
            if (scriptLoadedRef.current) {
                resolve();
                return;
            }

            // Create and configure the script element
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;

            // Set up load and error handlers
            script.onload = () => {
                scriptLoadedRef.current = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Spotify SDK script'));
            };

            // Add the script to the document
            document.body.appendChild(script);
        });
    };

    // Initialize the Spotify Player
    const initializePlayer = async (accessToken) => {
        // Create a new promise for SDK ready state
        const sdkReadyPromise = createSDKReadyPromise();

        // Define the callback that SDK will look for
        window.onSpotifyWebPlaybackSDKReady = () => {
            console.log('Spotify SDK is ready to initialize player');

            // Create the Spotify Player instance
            const spotifyPlayer = new window.Spotify.Player({
                name: 'Playhub Player',
                getOAuthToken: cb => cb(accessToken),
                volume: 0.5
            });

            // Set up all the player event listeners
            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Player ready with device ID:', device_id);
                setDeviceId(device_id);
                setPlayer(spotifyPlayer);
                setSdkState(SDK_STATES.READY);
                // Resolve our SDK ready promise
                if (sdkReadyPromiseRef.current) {
                    sdkReadyPromiseRef.current(device_id);
                }
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.warn('Device ID has gone offline:', device_id);
                setSdkState(SDK_STATES.ERROR);
            });

            spotifyPlayer.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize:', message);
                setSdkState(SDK_STATES.ERROR);
            });

            spotifyPlayer.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate:', message);
                setSdkState(SDK_STATES.ERROR);
            });

            spotifyPlayer.addListener('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account:', message);
                setSdkState(SDK_STATES.ERROR);
            });

            spotifyPlayer.addListener('player_state_changed', (state) => {
                console.log("listener player_state_change")
                console.log(state)
                // Update playing state
                if (state) {
                    setIsPlaying(!state.paused);
                    // Handle track completion
                    handleTrackEnd(state);
                }
            });

            // Connect to the player
            spotifyPlayer.connect().then(success => {
                if (!success) {
                    console.error('Failed to connect to Spotify player');
                    setSdkState(SDK_STATES.ERROR);
                }
            });
        };

        try {
            // First load the SDK script
            await loadSpotifyScript();

            // Wait for the SDK to be ready
            const deviceId = await sdkReadyPromise;
            return deviceId;
        } catch (error) {
            console.error('Error initializing Spotify player:', error);
            setSdkState(SDK_STATES.ERROR);
            throw error;
        }
    };

    // Fetch the Spotify token
    const fetchSpotifyToken = async () => {
        try {
            const response = await fetch('http://localhost:8000/spotify/token');
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Failed to fetch Spotify token:', error);
            return null;
        }
    };

    // Main initialization effect
    useEffect(() => {
        const initializeSDK = async () => {
            if (sdkState !== SDK_STATES.INITIAL) return;

            setSdkState(SDK_STATES.LOADING);
            try {
                const accessToken = await fetchSpotifyToken();
                if (!accessToken) {
                    throw new Error('Failed to get access token');
                }
                setToken(accessToken);

                await initializePlayer(accessToken);
            } catch (error) {
                console.error('Failed to initialize SDK:', error);
                setSdkState(SDK_STATES.ERROR);
            }
        };

        initializeSDK();

        // Cleanup function
        return () => {
            if (player) {
                player.disconnect();
            }
            delete window.onSpotifyWebPlaybackSDKReady;
        };
    }, []);

    const handleTrackEnd = useCallback(async (state) => {
        if (!state || !state.track_window) return;

        console.log("is track ending ?")
        console.log(state.duration && state.position >= state.duration - 1000)
        console.log(state.position === 0 && state.paused)
        // Check for track completion using multiple indicators
        const isTrackEnding = (
            // Check if we're at the end of the track
            (state.duration && state.position >= state.duration - 1000) ||
            // Or if the track has reset to the beginning and is paused
            (state.position === 0 && state.paused)
        );

        if (isTrackEnding && currentTrack) {
            // Find the next track in the queue
            const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
            const nextTrack = queue[currentIndex + 1];

            console.log("nextTrack")
            console.log(nextTrack)
            if (nextTrack) {
                console.log('Playing next track:', nextTrack.title);

                // Update the current track first
                setCurrentTrack(nextTrack);

                try {
                    // Ensure we have a valid device ID
                    if (!deviceId) {
                        console.error('No valid device ID found');
                        return;
                    }

                    // Play the next track
                    await playTrack(nextTrack.id, deviceId);
                    setIsPlaying(true);
                } catch (error) {
                    console.error('Error playing next track:', error);
                    setIsPlaying(false);
                }
            } else {
                // No more tracks in queue
                console.log('Reached end of queue');
                setIsPlaying(false);
            }
        }
    }, [queue, currentTrack, deviceId]);

    // Add an effect to monitor player state changes
    useEffect(() => {
        if (!player) return;

        const stateChangeListener = (state) => {
            if (state) {
                setIsPlaying(!state.paused);
                handleTrackEnd(state);
            }
        };

        player.addListener('player_state_changed', stateChangeListener);

        return () => {
            player.removeListener('player_state_changed', stateChangeListener);
        };
    }, [player, handleTrackEnd]);

    // Player control functions
    const playTrack = async (trackId) => {
        if (sdkState !== SDK_STATES.READY) {
            console.error('Player not ready');
            return;
        }

        try {
            await playSpotifyTrack(trackId, deviceId);
            const trackToPlay = queue.find(track => track.id === trackId);
            if (trackToPlay) {
                setCurrentTrack(trackToPlay);
            }

            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    const pauseTrack = async () => {
        if (sdkState !== SDK_STATES.READY) return;

        try {
            await pauseSpotifyTrack(deviceId);
            setIsPlaying(false);
        } catch (error) {
            console.error('Error pausing track:', error);
        }
    };

    const addToQueue = (track) => {
        // Only add if the track isn't already in the queue
        if (!queue.some(t => t.id === track.id)) {
            setQueue(prev => [...prev, track]);
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            queue,
            playTrack,
            pauseTrack,
            addToQueue,
            setQueue,
            setIsPlaying,
            deviceId,
            sdkState
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);