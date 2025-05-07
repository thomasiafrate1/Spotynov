const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/connect', spotifyController.connectSpotify);
router.get('/callback', spotifyController.spotifyCallback);
router.get('/recent-tracks', authenticateToken, spotifyController.getRecentTracks);
router.get('/top-tracks', authenticateToken, spotifyController.getTopTracks);
router.get('/top-artists', authenticateToken, spotifyController.getTopArtists);
router.get('/current-track', authenticateToken, spotifyController.getCurrentTrack);

module.exports = router;
