import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';
import axiosInstance from '../api/axiosInstance';
import './QuestionsSummary.css';

function QuestionsSummary() {
    const { test_id } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [isComplete, setIsComplete] = useState(false);  // <-- Controlled via state

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const testRes = await axiosInstance.get(`/tests/getTest/${test_id}`);
                setIsComplete(testRes.data.is_complete);  // <-- Save it in state

                if (testRes.data.is_complete) {
                    const res = await axiosInstance.get(`/questions/test/${test_id}`);
                    const data = res.data.map((q, index) => ({
                        questionText: q.question_text,
                        options: q.options.map(o => o.option_text),
                        correctOption: q.options.find(o => o.is_correct === 1)?.option_text || '',
                        image: q.image_url || '',
                        questionNumber: index + 1
                    }));
                    setQuestions(data);
                } else {
                    const stored = localStorage.getItem(`questions_${test_id}`);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        parsed.sort((a, b) => a.questionNumber - b.questionNumber); 
                        setQuestions(parsed);
                    }
                }
            } catch (err) {
                console.error("Error fetching test or questions:", err);
            }
        };

        fetchQuestions();
    }, [test_id]);

    const handleDelete = (idx) => {
        const updated = [...questions];
        updated.splice(idx, 1);
        updated.sort((a, b) => a.questionNumber - b.questionNumber); 
        setQuestions(updated);
        localStorage.setItem(`questions_${test_id}`, JSON.stringify(updated));
    };

    const handleEdit = (idx) => {
        navigate(`/edit-question/${test_id}/${idx}`);
    };

    const handleCompileTest = async () => {
        try {
            for (const q of questions) {
                const formData = new FormData();
                formData.append("test_id", test_id);
                formData.append("question_text", q.questionText);
                formData.append("marks", 1); 
                formData.append("negative_marks", 0);

                if (q.image && q.image.startsWith("data:image")) {
                    const blob = await (await fetch(q.image)).blob();
                    formData.append("image", blob, "question_image.png");
                }

                const optionsArray = q.options.map((opt) => ({
                    option_text: opt,
                    is_correct: q.correctOption === opt ? 1 : 0,
                }));

                formData.append("options", JSON.stringify(optionsArray));

                await axiosInstance.post("/questions/createQuestion", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            await axiosInstance.put(`/tests/mark-complete/${test_id}`);

            alert("Test compiled and sent to backend successfully!");
            localStorage.removeItem(`questions_${test_id}`);
            navigate("/");
        } catch (error) {
            console.error("Compilation error:", error);
            alert("An error occurred during test compilation.");
        }
    };

    return (
        <div className="summary-container">
            <h1 className="summary-title">QUESTIONS OF TEST_{test_id}</h1>
            <div className="summary-list">
                {questions.map((q, idx) => (
                    <QuestionCard
                        key={idx}
                        question={q}
                        index={idx}
                        expandedIndex={expandedIndex}
                        setExpandedIndex={setExpandedIndex}
                        onDelete={!isComplete ? handleDelete : undefined}
                        onEdit={!isComplete ? handleEdit : undefined}
                    />
                ))}
            </div>

            <div className='question-summary-buttons'>
                <button className="summary-home-btn" onClick={() => navigate('/')}>HOME</button>

                {!isComplete && (
                    <>
                        <button className="summary-home-btn" onClick={() => navigate(`/tests/${test_id}/add-questions`)}>ADD QUESTION</button>
                        <button className="summary-home-btn" onClick={handleCompileTest}>COMPILE TEST</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default QuestionsSummary;
