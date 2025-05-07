const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const { readUsersFile, writeUsersFile } = require('../utils/fileManager');


const clientId = '5996e16cdba64f768b013901df287254';
const clientSecret = '99646f68da854b7b81a0730b7135cc37';
const redirectUri = 'http://localhost:5500/api/spotify/callback';
const secretKey = "MY_SUPER_SECRET_KEY";

exports.connectSpotify = (req, res) => {
    const token = req.query.token;
    const scope = [
        'user-read-recently-played',
        'user-top-read',
        'user-read-playback-state' 
    ].join(' ');
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&state=${token}`;

    res.redirect(authUrl);
};

exports.spotifyCallback = async (req, res) => {
    const code = req.query.code;
    const token = req.query.state;
    try {
        const decoded = jwt.verify(token, secretKey);
        const username = decoded.username;
        const response = await axios.post('https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        const accessToken = response.data.access_token;
        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const spotifyUsername = profileResponse.data.display_name;
        const users = readUsersFile();
        const user = users.find(u => u.username === username);
        if (user) {
            user.spotify = {
                displayName: spotifyUsername
            };
            user.spotifyToken = accessToken;
            writeUsersFile(users);
        }
        res.redirect('http://localhost:5173/home');
    } catch (error) {
        res.status(500).send('Erreur lors de la connexion Spotify');
    }
};

exports.getRecentTracks = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }
        const decoded = jwt.verify(token, secretKey);
        const users = readUsersFile();
        const user = users.find(u => u.username === decoded.username);
        if (!user || !user.spotifyToken) {
            return res.status(400).json({ message: 'Spotify non connecté.' });
        }
        const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
            headers: {
                Authorization: `Bearer ${user.spotifyToken}`
            }
        });
        res.json(response.data.items);
    } catch (error) {
        res.status(500).json({ message: 'Erreur interne : ' + (error.response?.data?.error?.message || error.message) });
    }
};

exports.getTopTracks = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secretKey);
        const users = readUsersFile();
        const user = users.find(u => u.username === decoded.username);
        if (!user || !user.spotifyToken) {
            return res.status(400).json({ message: 'Spotify non connecté.' });
        }
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=5', {
            headers: {
                Authorization: `Bearer ${user.spotifyToken}`
            }
        });
        res.json(response.data.items);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tops tracks.' });
    }
};

exports.getTopArtists = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secretKey);
        const users = readUsersFile();
        const user = users.find(u => u.username === decoded.username);
        if (!user || !user.spotifyToken) {
            return res.status(400).json({ message: 'Spotify non connecté.' });
        }
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=5', {
            headers: {
                Authorization: `Bearer ${user.spotifyToken}`
            }
        });
        res.json(response.data.items);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tops artistes.' });
    }
};

exports.getCurrentTrack = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'MY_SUPER_SECRET_KEY');
        const users = readUsersFile();
        const user = users.find(u => u.username === decoded.username);
        if (!user || !user.spotifyToken) {
            return res.status(400).json({ message: 'Spotify non connecté.' });
        }
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: `Bearer ${user.spotifyToken}`
            },
            validateStatus: (status) => true 
        });
        if (!response.data || !response.data.item) {
            return res.status(204).json({ message: 'Aucune musique en cours' });
        }
        const item = response.data.item;
        const track = {
            name: item.name,
            artist: item.artists.map(a => a.name).join(', '),
            image: item.album.images[0]?.url
        };
        res.json(track);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du morceau en cours.' });
    }
};

