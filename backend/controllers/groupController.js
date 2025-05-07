const { readUsersFile, writeUsersFile } = require('../utils/fileManager');

exports.joinGroup = (req, res) => {
    const { groupName } = req.body;
    const username = req.user.username;

    if (!groupName || groupName.trim() === '') {
        return res.status(400).json({ message: 'Le nom du groupe est requis.' });
    }

    const users = readUsersFile();
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    if (user.group) {
        const oldGroupName = user.group.name;
        const oldGroupMembers = users.filter(u => u.group && u.group.name === oldGroupName);

        if (oldGroupMembers.length > 1 && user.group.isAdmin) {
            const others = oldGroupMembers.filter(u => u.username !== username);
            const newAdmin = others[Math.floor(Math.random() * others.length)];
            newAdmin.group.isAdmin = true;
        }
        user.group = null;

        const stillMembers = users.filter(u => u.group && u.group.name === oldGroupName);
        if (stillMembers.length === 0) {
        }
    }

    const groupAlreadyExists = users.some(u => u.group && u.group.name === groupName);

    if (groupAlreadyExists) {
        user.group = { name: groupName.trim(), isAdmin: false };
    } else {
        user.group = { name: groupName.trim(), isAdmin: true };
    }

    writeUsersFile(users);

    res.status(200).json({ message: `Vous avez rejoint le groupe : ${groupName}` });
};

exports.getGroups = (req, res) => {
    const users = readUsersFile();
    const groups = [...new Set(
        users
            .filter(u => u.group)
            .map(u => u.group.name)
    )];

    res.json({ groups });
};
