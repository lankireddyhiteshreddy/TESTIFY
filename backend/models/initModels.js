const User = require('./userModel');
const Test = require('./testsModel');
const Question = require('./questionsModel');
const Option = require('./optionsModel');
const Attempt = require('./attemptsModel');
const Response = require('./responsesModel');
const AttemptEvaluation = require('./attemptsEvaluationModel'); 

function initModels() {

    // User ↔ Tests
    User.hasMany(Test, {
        foreignKey: 'creator_id',
        as: 'tests',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Test.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

    // Test ↔ Questions
    Test.hasMany(Question, {
        foreignKey: 'test_id',
        as: 'questions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Question.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

    // Question ↔ Options
    Question.hasMany(Option, {
        foreignKey: 'question_id',
        as: 'options',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Option.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

    // User ↔ Attempts
    User.hasMany(Attempt, {
        foreignKey: 'user_id',
        as: 'attempts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Attempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    // Test ↔ Attempts
    Test.hasMany(Attempt, {
        foreignKey: 'test_id',
        as: 'attempts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Attempt.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

    // Attempt ↔ Responses
    Attempt.hasMany(Response, {
        foreignKey: 'attempt_id',
        as: 'responses',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Response.belongsTo(Attempt, { foreignKey: 'attempt_id', as: 'attempt' });

    // Question ↔ Responses
    Question.hasMany(Response, {
        foreignKey: 'question_id',
        as: 'responses',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Response.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

    // Attempt ↔ AttemptEvaluation (One-to-One)
    Attempt.hasOne(AttemptEvaluation, {
        foreignKey: 'attempt_id',
        as: 'evaluation',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    AttemptEvaluation.belongsTo(Attempt, {
        foreignKey: 'attempt_id',
        as: 'attempt'
    });
}

module.exports = initModels;
