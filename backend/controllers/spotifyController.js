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
    const scope = 'user-read-private user-read-email';

    const url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: token 
        });

    res.redirect(url);
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
            writeUsersFile(users);
            console.log(`✅ ${username} lié à Spotify sous le nom ${spotifyUsername}`);
        }

        res.redirect('http://localhost:5173/home');

    } catch (error) {
        console.error('Erreur lors du callback Spotify', error.response?.data || error.message);
        res.status(500).send('Erreur lors de la connexion Spotify');
    }
};

