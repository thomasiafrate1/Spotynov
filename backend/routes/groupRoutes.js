const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/join', authenticateToken, groupController.joinGroup);
router.get('/', groupController.getGroups);

module.exports = router;
