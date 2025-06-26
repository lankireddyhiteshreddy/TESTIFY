const passport = require('passport');
const {deleteTestById,getAllPublicTests,createTest,getMyTests,getTestBasedOnId,markTestComplete,updateTest,uploadKey,evaluateTest,evaluateTestFinalByAttempt, getResultsForTest,publishTest} = require('../controllers/testsController');
const express = require('express');

const router = express.Router();

//create test
router.post('/createTest',passport.authenticate('jwt',{session:false}),createTest);

//get test based on id
router.get('/getTest/:test_id',passport.authenticate('jwt',{session:false}),getTestBasedOnId);

//get all users tests
router.get('/getMyTests',passport.authenticate('jwt',{session:false}),getMyTests);

//mark test as complete (update is_complete to 1)
router.put('/mark-complete/:test_id', passport.authenticate('jwt', { session: false }), markTestComplete);

//update test
router.put('/editTest/:test_id',passport.authenticate("jwt", { session: false }), updateTest)

//upload the key if not already
router.post('/:test_id/upload-key', passport.authenticate('jwt', { session: false }), uploadKey);

//evaluate test 
router.post('/:test_id/evaluate', passport.authenticate('jwt', { session: false }), evaluateTest);

//fetch evaluation details by attempt
router.get('/:attempt_id/evaluate/final', passport.authenticate('jwt', { session: false }), evaluateTestFinalByAttempt);

//get results by test
router.get('/:test_id/results',passport.authenticate('jwt',{session:false}),getResultsForTest)

//get all public tests
router.get('/getAllPublicTests',passport.authenticate('jwt',{session:false}),getAllPublicTests);

//publish test
router.post('/:test_id/publish',passport.authenticate('jwt',{session:false}),publishTest);

//delete test by id 
router.delete('/:test_id/delete',passport.authenticate('jwt',{session:false}),deleteTestById);

module.exports = router;

