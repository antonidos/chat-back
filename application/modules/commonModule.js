const md5 = require('md5');
const { HOST, UPLOADS, PATH_TO_DIR } = require('../../settings');

module.exports.hashUserData = (userName, password) => {
    const num = Math.round(Math.random() * 1000000);
    const passHash = md5(userName + password);
    const token = md5(passHash + String(num));
    return { passHash, token };
}

module.exports.getPathToFileAPI = (filename) => {
    return filename ? `${HOST}/${UPLOADS.IMAGES.TODO.FOLDER_PATH}/${filename}` : '';
}

module.exports.getPathToFileInDateisystem = (filename) => {
    return filename ? `${PATH_TO_DIR}/${UPLOADS.IMAGES.TODO.FOLDER_PATH}/${filename}` : '';
}