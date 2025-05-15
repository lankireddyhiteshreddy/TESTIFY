const {createQuestion} = require('../controllers/questionsController');
const passport = require('../config/passport');
const express = require('express');
const { session } = require('../config/passport');
const multer = require('multer');
const {storage} = require('../config/cloudinary');  // import multer storage config
const upload = multer({storage});
const app = express();

const router = express.Router();

//create question
router.post('/createQuestion',passport.authenticate('jwt',{session:false}),upload.single('image'),createQuestion);

module.exports = router;