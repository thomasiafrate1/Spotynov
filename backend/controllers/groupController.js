const { readUsersFile, writeUsersFile } = require('../utils/fileManager');

exports.joinGroup = (req, res) => {
    const { groupName } = req.body;
    const username = req.user.username;

    console.log('✅ Requête reçue sur /groups/join');

    if (!groupName || groupName.trim() === '') {
        return res.status(400).json({ message: 'Le nom du groupe est requis.' });
    }

    const users = readUsersFile();
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Si l'utilisateur était déjà dans un groupe
    if (user.group) {
        const oldGroupName = user.group.name;
        const oldGroupMembers = users.filter(u => u.group && u.group.name === oldGroupName);

        if (oldGroupMembers.length > 1 && user.group.isAdmin) {
            // Choisir un nouvel admin
            const others = oldGroupMembers.filter(u => u.username !== username);
            const newAdmin = others[Math.floor(Math.random() * others.length)];
            newAdmin.group.isAdmin = true;
            console.log(`👑 ${newAdmin.username} devient Admin du groupe ${oldGroupName}`);
        }

        // Retirer l'utilisateur de son ancien groupe
        user.group = null;

        // Vérifier s'il reste des membres dans l'ancien groupe
        const stillMembers = users.filter(u => u.group && u.group.name === oldGroupName);
        if (stillMembers.length === 0) {
            console.log(`🗑️ Le groupe ${oldGroupName} est supprimé car il n'a plus de membres.`);
        }
    }

    // Vérifier si le nouveau groupe existe
    const groupAlreadyExists = users.some(u => u.group && u.group.name === groupName);

    if (groupAlreadyExists) {
        user.group = { name: groupName.trim(), isAdmin: false };
        console.log(`ℹ️ ${username} a rejoint le groupe existant ${groupName}`);
    } else {
        user.group = { name: groupName.trim(), isAdmin: true };
        console.log(`🆕 ${username} a créé le groupe ${groupName} et devient Admin`);
    }

    writeUsersFile(users);

    res.status(200).json({ message: `Vous avez rejoint le groupe : ${groupName}` });
};

exports.getGroups = (req, res) => {
    const users = readUsersFile();

    // Créer une liste unique des groupes existants
    const groups = [...new Set(
        users
            .filter(u => u.group)
            .map(u => u.group.name)
    )];

    res.json({ groups });
};
