import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5500/api', // Ton backend
});

export default api;
