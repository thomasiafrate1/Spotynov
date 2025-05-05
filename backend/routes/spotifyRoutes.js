const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');

router.get('/connect', spotifyController.connectSpotify);
router.get('/callback', spotifyController.spotifyCallback);

module.exports = router;
