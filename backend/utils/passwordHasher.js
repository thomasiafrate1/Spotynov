const crypto = require('crypto');

exports.hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

exports.verifyPassword = (password, hashedPassword) => {
    return this.hashPassword(password) === hashedPassword;
};
