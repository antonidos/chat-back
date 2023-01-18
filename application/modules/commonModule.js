const md5 = require('md5');

module.exports.hashUserData = (userName, password) => {
    const num = Math.round(Math.random() * 1000000);
    const passHash = md5(userName + password);
    const token = md5(passHash + String(num));
    return { passHash, token };
}