const { hashPassword, verifyPassword } = require('../utils/passwordHasher');
const { readUsersFile, writeUsersFile } = require('../utils/fileManager');
const jwt = require('jsonwebtoken');
const secretKey = "MY_SUPER_SECRET_KEY";

exports.register = (req, res) => {
    const { username, password } = req.body;
    const users = readUsersFile();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = {
        username,
        password: hashPassword(password),
        group: null,
        spotify: null
    };
    users.push(newUser);
    writeUsersFile(users);
    res.status(201).json({ message: 'User created successfully' });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    const users = readUsersFile();
    const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });

    const user = users.find(u => u.username === username);
    if (!user || !verifyPassword(password, user.password)) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ token });
};

exports.getMe = (req, res) => {
    const username = req.user.username;
    const users = readUsersFile();
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    console.log('✅ Données envoyées à /auth/me :', {
        username: user.username,
        group: user.group,
        spotify: user.spotify
    });
    res.json({
        username: user.username,
        group: user.group,
        spotify: user.spotify
    });
};
