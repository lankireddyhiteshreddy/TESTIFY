const Attempt = require('../models/attemptsModel');
const Response = require('../models/responsesModel');

const submitTest = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { test_id, responses } = req.body;

        if (!test_id || !responses || !Array.isArray(responses)) {
            return res.status(400).json({ message: "Invalid request format" });
        }

        // 1. Create Attempt
        const newAttempt = await Attempt.create({
            test_id,
            user_id
        });

        // 2. Create Responses
        const responsePromises = responses.map(resp => {
            const selected = Array.isArray(resp.selected_option_ids) ? resp.selected_option_ids : [];

            return Response.create({
                attempt_id: newAttempt.attempt_id,
                question_id: resp.question_id,
                selected_options_ids: JSON.stringify(selected), // Assuming DB stores it as JSON/text
                is_correct: typeof resp.is_correct === 'number' ? resp.is_correct : -1
            });
        });

        await Promise.all(responsePromises);

        return res.status(200).json({
            message: "Test submitted successfully",
            attempt_id: newAttempt.attempt_id
        });

    } catch (error) {
        console.error("Error submitting test:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { submitTest };
