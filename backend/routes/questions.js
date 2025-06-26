const {createQuestion,getQuestionsByTestId} = require('../controllers/questionsController');
const passport = require('passport');
const express = require('express');
const { session } = require('passport');
const multer = require('multer');
const {storage} = require('../config/cloudinary');  // import multer storage config
const upload = multer({storage});
const app = express();

const router = express.Router();

//create question
router.post('/createQuestion',passport.authenticate('jwt',{session:false}),upload.single('image'),createQuestion);
 
//get questions by test 
router.get('/test/:test_id', passport.authenticate('jwt', { session: false }), getQuestionsByTestId);


module.exports = router;