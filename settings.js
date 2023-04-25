const path = require('path');

const SETTINGS = {
    HOST: 'http://localhost:8080',
    PORT: 8080,
    DB_PATH: './application/modules/DB/db.db',
    UPLOADS: {
        FOLDER_PATH: "uploads",
        IMAGES: {
            FOLDER_PATH: "uploads/images",
            TODO: {
                FOLDER_PATH: "uploads/images/avatars"
            },
        },
    },
    PATH_TO_DIR: path.dirname(__filename), 
    MULTER: {
        TASK_PICTURE: {
            NAME: "avatar"
        }
    }
}

module.exports = SETTINGS;