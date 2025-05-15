const Question = require('../models/questionsModel');
const Test = require('../models/testsModel');
const Options = require('../models/optionsModel');

const createQuestion = async(req,res)=>{
    try{
        const user_id = req.user.user_id;  
        const {test_id, question_text, marks, negative_marks, options} = req.body;
        
        if (!test_id || !question_text || marks === undefined) {
            return res.json({ message: "test_id, question_text and marks are required" });
        }

        //checking if the test exists and belongs to the logged-in user 
        const test = await Test.findOne({ where: { test_id } });
        if (!test) return res.json({ message: "Test not found" });

        if (test.creator_id !== userId) {
            return res.json({ message: "You are not authorized to add questions to this test" });
        }

        const image_url = req.file?req.file.path : null;

        const newQuestion = await Question.create({
            test_id,
            question_text,
            image_url,
            marks,
            negative_marks : negative_marks || 0
        });

        // Determine if answer key uploaded
        const isAnswerKeyUploaded = test.answer_key_uploaded === 1;

        // Insert options
        if (options && Array.isArray(options)) {
            for (const opt of options) {
                await Option.create({
                    question_id: question.question_id,
                    option_text: opt.option_text,
                    is_correct: isAnswerKeyUploaded ? (opt.is_correct || 0) : 0
                });
            }   
        }

        res.json({message : "Question created successfully", question : newQuestion});

    }
    catch(e){
        res.json({error:e.message});
    }
}

module.exports = {createQuestion}; 