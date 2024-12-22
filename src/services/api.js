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
export const getSpotifyToken = () => api.get('/spotify/token');
export const playTrack = (trackUri) => api.put('/spotify/play', { uris: [trackUri] });