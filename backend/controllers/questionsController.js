const Question = require('../models/questionsModel');
const Test = require('../models/testsModel');
const Option = require('../models/optionsModel');

const createQuestion = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { test_id, question_text, marks, negative_marks, options } = req.body;

        if (!test_id || !question_text || marks === undefined) {
            return res.json({ message: "test_id, question_text and marks are required" });
        }

        const test = await Test.findOne({ where: { test_id } });
        if (!test) return res.json({ message: "Test not found" });

        if (test.creator_id !== user_id) {
            return res.json({ message: "You are not authorized to add questions to this test" });
        }

        const image_url = req.file ? req.file.path : null;

        const newQuestion = await Question.create({
            test_id,
            question_text,
            image_url,
            marks,
            negative_marks: negative_marks || 0
        });

        const isAnswerKeyUploaded = test.answer_key_uploaded === 1;

        let parsedOptions = [];
        try {
            parsedOptions = JSON.parse(options);
        } catch (err) {
            return res.json({ message: "Invalid options format. Expecting JSON." });
        }

        if (parsedOptions && Array.isArray(parsedOptions)) {
            for (const opt of parsedOptions) {
                await Option.create({
                    question_id: newQuestion.question_id,
                    option_text: opt.option_text,
                    is_correct: isAnswerKeyUploaded ? (opt.is_correct || 0) : 0
                });
            }
        }

        res.json({ message: "Question created successfully", question: newQuestion });

    } catch (e) {
        res.json({ error: e.message });
    }
};

const getQuestionsByTestId = async (req, res) => {
    try {
        const { test_id } = req.params;

        const questions = await Question.findAll({
            where: { test_id },
            include: [
                {
                    model: Option,
                    as: 'options'
                }
            ],
            order: [['question_id', 'ASC']]
        });

        res.json(questions);
    } catch (e) {
        console.error("Error in getQuestionsByTestId:", e);
        res.status(500).json({ error: e.message });
    }
};


module.exports = { createQuestion ,getQuestionsByTestId};
