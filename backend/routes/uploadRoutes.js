const express = require('express');
const passport = require('passport');
const multer = require('multer');
const {processPDF} = require('../controllers/uploadController');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage});

router.post('/upload',passport.authenticate('jwt',{session:false}),upload.single('pdf'),processPDF);

module.exports = router;