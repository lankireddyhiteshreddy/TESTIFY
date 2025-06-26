const Test = require('../models/testsModel');
const Option = require('../models/optionsModel');
const Question = require('../models/questionsModel');
const Attempt = require('../models/attemptsModel');
const Response = require('../models/responsesModel');
const AttemptEvaluation = require('../models/attemptsEvaluationModel');

const getTestBasedOnId = async (req, res) => {
    const { test_id } = req.params;
    try {
        const test = await Test.findByPk(test_id);
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.json(test);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching test' });
    }
};

const getMyTests = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        console.log(req.user.user_id);

        const tests = await Test.findAll({
            where: {creator_id: user_id }
        });

        res.status(200).json(tests);
    } catch (err) {
        console.error("Error fetching tests:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createTest = async (req, res) => {
    try {
        const creator_id = req.user.user_id;
        const { title, description, is_public, test_duration, answer_key_uploaded, is_complete } = req.body;

        if (!title || !test_duration) {
            return res.status(400).json({ message: 'Title and test duration are required' });
        }

        const newTest = await Test.create({
            creator_id,
            title,
            description,
            is_public: is_public || 0,
            test_duration,
            answer_key_uploaded,
            is_complete: is_complete || 0
        });

        res.json({ message: 'Test created successfully', test: newTest });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const markTestComplete = async (req, res) => {
    const { test_id } = req.params;
    try {
        const test = await Test.findByPk(test_id);
        if (!test) return res.status(404).json({ message: "Test not found" });

        test.is_complete = 1;
        await test.save();

        res.status(200).json({ message: "Test marked as complete" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateTest = async (req, res) => {
    try {
        const { test_id } = req.params;
        const user_id = req.user.user_id;
        const { title, description, test_duration, is_public } = req.body;

        const test = await Test.findByPk(test_id);

        if (!test) return res.status(404).json({ message: "Test not found" });
        if (test.creator_id !== user_id)
            return res.status(403).json({ message: "Not authorized" });

        await Test.update(
            { title, description, test_duration, is_public },
            { where: { test_id } }
        );

        res.json({ message: "Test updated successfully" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const uploadKey = async (req, res) => {
    const { test_id } = req.params;
    const { correctOptions } = req.body;

    try {
        const test = await Test.findByPk(test_id);
        if (!test) return res.status(404).json({ message: "Test not found" });

        const questions = await Question.findAll({ where: { test_id } });
        const questionIds = questions.map(q => q.question_id);

        const allOptions = await Option.findAll({
            where: { question_id: questionIds }
        });
        const allOptionIds = allOptions.map(opt => opt.option_id);

        for (const qId in correctOptions) {
            if (!questionIds.includes(parseInt(qId))) {
                return res.status(400).json({ message: `Invalid question_id: ${qId}` });
            }
            const optionsForQ = correctOptions[qId];
            const isValid = optionsForQ.every(optId => allOptionIds.includes(optId));
            if (!isValid) {
                return res.status(400).json({ message: `Invalid option ID for question ${qId}` });
            }
        }

        await Option.update({ is_correct: false }, {
            where: { question_id: questionIds }
        });

        const correctOptionFlat = Object.values(correctOptions).flat();
        await Option.update({ is_correct: true }, {
            where: { option_id: correctOptionFlat }
        });

        await Test.update({ answer_key_uploaded: true }, { where: { test_id } });

        return res.status(200).json({ message: "Answer key uploaded successfully." });
    } catch (err) {
        console.error("Error uploading key:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

const evaluateTest = async (req, res) => {
    const { test_id } = req.params;
    const user_id = req.user.user_id;

    try {
        const test = await Test.findByPk(test_id);
        if (!test) return res.status(404).json({ message: "Test not found" });
        if (!test.answer_key_uploaded) return res.json({ redirect: "upload-key" });

        const latestAttempt = await Attempt.findOne({
            where: { test_id, user_id },
            order: [['attempt_id', 'DESC']]
        });
        if (!latestAttempt) return res.status(400).json({ message: "No attempt found for evaluation." });

        const responses = await Response.findAll({
            where: { attempt_id: latestAttempt.attempt_id }
        });

        const questions = await Question.findAll({ where: { test_id } });
        const questionIds = questions.map(q => q.question_id);

        const correctOptions = await Option.findAll({
            where: { question_id: questionIds, is_correct: true }
        });

        const correctMap = {};
        correctOptions.forEach(opt => {
            if (!correctMap[opt.question_id]) correctMap[opt.question_id] = [];
            correctMap[opt.question_id].push(opt.option_id);
        });

        let score = 0;
        const maxScore = questions.length;
        const detailedResults = [];

        responses.forEach(r => {
            const correct = (correctMap[r.question_id] || []).map(Number).sort();

            let selectedRaw = [];
            try {
                selectedRaw = JSON.parse(r.selected_options_ids);
            } catch (e) {
                console.error("Invalid JSON for selected_options_ids:", r.selected_options_ids);
                selectedRaw = [];
            }

            const selected = (selectedRaw || []).map(Number).sort();
            const isCorrect = arraysEqual(selected, correct);

            if (isCorrect) score += 1;

            detailedResults.push({
                question_id: r.question_id,
                selected_options: selected,
                correct_options: correct,
                is_correct: isCorrect
            });
        });

        latestAttempt.total_score = score;
        latestAttempt.max_score = maxScore;
        await latestAttempt.save();

        await AttemptEvaluation.create({
            attempt_id: latestAttempt.attempt_id,
            detailed_analysis: JSON.stringify({
                total: maxScore,
                correct: score,
                wrong: maxScore - score,
                questions: detailedResults
            })
        });

        return res.json({
            score,
            max_score: maxScore,
            attempt_id: latestAttempt.attempt_id
        });

    } catch (err) {
        console.error("Error in evaluation:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

const evaluateTestFinalByAttempt = async (req, res) => {
    const { attempt_id } = req.params;
    const user_id = req.user.user_id;

    try {
        const attempt = await Attempt.findByPk(attempt_id);
        if (!attempt) return res.status(404).json({ message: "Attempt not found" });
        if (attempt.user_id !== user_id)
            return res.status(403).json({ message: "Not authorized to view this attempt" });

        const test = await Test.findByPk(attempt.test_id);
        if (!test) return res.status(404).json({ message: "Test not found" });
        if (!test.answer_key_uploaded) return res.json({ redirect: "upload-key" });

        const evaluation = await AttemptEvaluation.findOne({
            where: { attempt_id }
        });

        if (!evaluation) {
            return res.status(404).json({ message: "Evaluation not available. Please contact admin." });
        }

        let detailedAnalysis = evaluation.detailed_analysis;
        
        if (typeof detailedAnalysis === 'string') {
            try {
                detailedAnalysis = JSON.parse(detailedAnalysis);
            } catch (e) {
                console.error("Invalid JSON format for detailed_analysis:", e);
                return res.status(500).json({ message: "Corrupted evaluation data" });
            }
        }

        if (!detailedAnalysis.questions || !Array.isArray(detailedAnalysis.questions)) {
            return res.status(500).json({ message: "Incomplete evaluation data" });
        }

        const resultsMap = {};
        detailedAnalysis.questions.forEach(r => {
            resultsMap[r.question_id] = r;
        });

        const questions = await Question.findAll({
            where: { test_id: attempt.test_id },
            include: [{ model: Option, as: 'options' }]
        });

        const questionsWithDetails = questions.map(q => {
            const result = resultsMap[q.question_id] || {};
            return {
                question_id: q.question_id,
                question_text: q.question_text,
                is_correct: result.is_correct || false,
                options: (q.options || []).map(opt => ({
                    option_id: opt.option_id,
                    option_text: opt.option_text,
                    is_correct: opt.is_correct,
                    is_marked_by_user: (result.selected_options || []).includes(opt.option_id)
                }))
            };
        });

        return res.json({
            total: questions.length,
            correct: questionsWithDetails.filter(q => q.is_correct).length,
            wrong: questionsWithDetails.filter(q => !q.is_correct).length,
            questions: questionsWithDetails
        });

    } catch (err) {
        console.error("Error in evaluation by attempt:", err);
        return res.status(500).json({ message: "Server error" });
    }
};



const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
};

const getResultsForTest = async (req, res) => {
    const { test_id } = req.params;
    const user_id = req.user.user_id;

    try {
        console.log(test_id);
        const test = await Test.findByPk(test_id);
        console.log(test);
        if (!test) return res.status(404).json({ message: "Test not found" });

        const attempts = await Attempt.findAll({
            where: { user_id, test_id },
            order: [['attempt_id', 'DESC']]
        });

        if (attempts.length === 0) {
            return res.status(200).json({ results: [] });
        }

        const evaluations = await AttemptEvaluation.findAll({
            where: { attempt_id: attempts.map(a => a.attempt_id) }
        });

        const evalMap = {};
        evaluations.forEach(e => {
            evalMap[e.attempt_id] = e;
        });

        const results = attempts.map(a => {
            let detailedAnalysis = evalMap[a.attempt_id]?.detailed_analysis || null;

            if (typeof detailedAnalysis === 'string') {
                try {
                    detailedAnalysis = JSON.parse(detailedAnalysis);
                } catch (e) {
                    console.error(`Corrupted evaluation for attempt_id ${a.attempt_id}`);
                    detailedAnalysis = null;
                }
            }

            return {
                attempt_id: a.attempt_id,
                total_score: a.total_score,
                max_score: a.max_score,
                detailed_analysis: detailedAnalysis
            };
        });

        return res.json({ results });

    } catch (err) {
        console.error("Error fetching results for test:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


const getAllPublicTests = async(req,res)=>{
    try {

        const tests = await Test.findAll({
            where: {is_public:true}
        });

        res.status(200).json(tests);
    } catch (err) {
        console.error("Error fetching tests:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const publishTest = async (req, res) => {
    try {
        const { test_id } = req.params;
        const curTest = await Test.findByPk(test_id);
        if (!curTest) {
            return res.status(404).json({ message: "Test not found" });
        }

        await curTest.update({ is_public: true });

        return res.status(200).json({ message: "Test published successfully", test: curTest });
    } catch (err) {
        console.error("Error publishing test:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteTestById = async(req,res)=>{
    const {test_id} = req.params;
    const user_id = req.user.user_id;
    try{
        const test = await Test.findByPk(test_id);

        if(!test){
            return res.status(404).json({ message: "Test not found" });
        }

        if(test.creator_id!=user_id){
            return res.status(403).json({ message: "You are not authorized to delete this test" });
        }

        await test.destroy();

        res.status(200).json({ message: "Test deleted successfully" });
    }
    catch(err){
        console.error("Error deleting test : ",err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    createTest,
    getMyTests,
    getTestBasedOnId,
    markTestComplete,
    updateTest,
    uploadKey,
    evaluateTest,
    evaluateTestFinalByAttempt,
    getResultsForTest,
    getAllPublicTests,
    publishTest,
    deleteTestById
};
