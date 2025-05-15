const Test = require('../models/testsModel');

const createTest = async(req,res) => {
    try{
        const creator_id = req.user.user_id;
        const {title, description, is_public, test_duration, answer_key_uploaded} = req.body;

        if(!title || !test_duration){
            return res.json({message : 'Title and test duration are required'});
        }

        const newTest = await Test.create({
            creator_id,
            title,
            description,
            is_public : is_public || 0,
            test_duration,
            answer_key_uploaded
        });

        res.json({message : 'Test created successfully', test : newTest});
    }
    catch(e){
        res.json({error : e.message});
    }
}

module.exports = {createTest};