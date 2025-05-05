const fs = require('fs');
const filePath = './users.json';

exports.readUsersFile = () => {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
};

exports.writeUsersFile = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};
