const multer = require('multer');
const { UPLOADS, MULTER } = require('../../../settings');
 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./${UPLOADS.IMAGES.TODO.FOLDER_PATH}`);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            cb(new Error('Please upload an image.'));
        }
        cb(undefined, true);
    },
}).single(MULTER.TASK_PICTURE.NAME);

module.exports = upload;