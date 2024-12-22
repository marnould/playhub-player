import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000'
});

export const getTracks = async () => {
    try {
        const response = await axios.get(`http://localhost:8000/api/tracks`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fonction pour jouer une piste Spotify via l'API Symfony.
 * @param {string} trackId - L'ID de la piste Spotify à jouer.
 * @param {string} deviceId
 * @returns {Promise} - La promesse d'une réponse de l'API.
 */
export const playSpotifyTrack = async (trackId, deviceId) => {
    try {
        const response = await axios.put(`http://localhost:8000/spotify/play`, {
            trackId: trackId,
            deviceId: deviceId
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la lecture de la piste Spotify', error);
        throw error;
    }
};

/**
 * Fonction pour mettre en pause une piste Spotify via l'API Symfony.
 * @param {string} deviceId
 * @returns {Promise} - La promesse d'une réponse de l'API.
 */
export const pauseSpotifyTrack = async (deviceId) => {
    try {
        const response = await axios.put(`http://localhost:8000/spotify/pause`, {
            deviceId: deviceId
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la pause de la piste Spotify', error);
        throw error;
    }
};
