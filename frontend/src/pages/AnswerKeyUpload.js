import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import './AnswerKeyUpload.css';

export default function AnswerKeyUpload() {
    const { test_id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axiosInstance.get(`/questions/test/${test_id}`);
                setQuestions(res.data);
            } catch (err) {
                console.error("Error fetching questions:", err);
            }
        };

        fetchQuestions();
    }, [test_id]);

    const handleOptionToggle = (question_id, option_id) => {
        setSelectedOptions(prev => {
            const prevSelected = Array.isArray(prev[question_id]) ? prev[question_id] : [];

            if (prevSelected.includes(option_id)) {
                // Remove option
                return {
                    ...prev,
                    [question_id]: prevSelected.filter(id => id !== option_id)
                };
            } else {
                // Add option
                return {
                    ...prev,
                    [question_id]: [...prevSelected, option_id]
                };
            }
        });
    };

    const handleSubmit = async () => {
        try {
            // Validate all questions have at least one correct option
            const allMarked = questions.every(q => selectedOptions[q.question_id]?.length > 0);

            if (!allMarked) {
                alert("Please mark at least one correct option for each question.");
                return;
            }

            await axiosInstance.post(`/tests/${test_id}/upload-key`, {
                correctOptions: selectedOptions
            });

            alert("Answer key uploaded successfully!");
            navigate(`/tests/${test_id}/evaluate/final`);
        } catch (err) {
            console.error("Error uploading answer key:", err);
            alert("Error uploading answer key.");
        }
    };

    return (
        <div className="answer-key-container">
            <h2 className="answer-key-title">Mark Correct Options (Multiple Allowed)</h2>

            {questions.map(q => (
                <div key={q.question_id} className="question-block">
                    <p className="question-text">{q.question_text}</p>
                    <ul className="option-list">
                        {q.options.map(opt => (
                            <li key={opt.option_id} className="option-item" onClick={() => handleOptionToggle(q.question_id, opt.option_id)}>
                                <input
                                    type="checkbox"
                                    id={`q-${q.question_id}-opt-${opt.option_id}`}
                                    onClick={() => handleOptionToggle(q.question_id, opt.option_id)}
                                    checked={selectedOptions[q.question_id]?.includes(opt.option_id) || false}
                                    className="mr-2"
                                />
                                <label htmlFor={`q-${q.question_id}-opt-${opt.option_id}`}>
                                    {opt.option_text}
                                </label>
                            </li>
                        ))}

                    </ul>
                </div>
            ))}

            <button
                onClick={handleSubmit}
                className="submit-btn"
            >
                Submit Answer Key
            </button>
        </div>
    );
}
