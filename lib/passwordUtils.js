const crypto = require('crypto');

function genSaltAndHash(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt,
      hash,
    };
}

function validatePassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

module.exports.validatePassword = validatePassword;
module.exports.genSaltAndHash = genSaltAndHash;