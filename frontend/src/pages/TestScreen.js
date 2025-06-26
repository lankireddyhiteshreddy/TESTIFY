import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionPanel from './QuestionPanel';
import QuestionNavigator from './QuestionNavigator';
import Timer from './Timer';
import NavButtons from './NavButtons';
import axiosInstance from '../api/axiosInstance';
import './TestScreen.css';

export default function TestScreen() {
    const { test_id } = useParams();
    const navigate = useNavigate();

    const [testData, setTestData] = useState(null);
    const [responses, setResponses] = useState({});
    const [currentQIndex, setCurrentQIndex] = useState(0);

    useEffect(() => {
        const test = JSON.parse(localStorage.getItem('activeTest'));
        const storedResponses = JSON.parse(localStorage.getItem('testResponses'));

        if (!test || parseInt(test.test_id) !== parseInt(test_id)) {
            alert("Invalid test session.");
            return navigate('/');
        }

        setTestData(test);
        setResponses(storedResponses);
    }, [test_id, navigate]);

    const updateResponse = (question_id, selected_option_ids) => {
        const updated = {
            ...responses,
            [question_id]: {
                ...responses[question_id],
                selected_option_ids
            }
        };
        setResponses(updated);
        localStorage.setItem('testResponses', JSON.stringify(updated));
    };

    if (!testData) return <div>Loading test...</div>;

    const currentQuestion = testData.questions[currentQIndex];

    const handleSubmitTest = async () => {
        const confirmSubmit = window.confirm("Are you sure you want to submit the test?");
        if (!confirmSubmit) return;

        try {
            const test = JSON.parse(localStorage.getItem('activeTest'));
            const responses = JSON.parse(localStorage.getItem('testResponses'));

            if (!test || !responses) {
                alert("Test session is invalid.");
                return navigate('/');
            }
            console.log(responses);

            const formattedResponses = test.questions.map(q => {
                const r = responses[q.question_id];
                return {
                    question_id: q.question_id,
                    selected_option_ids: r?.selected_option_ids || [],
                    is_correct: -1
                };
            });

            // Submit responses
            const response = await axiosInstance.post('/responses/submit', {
                test_id: test.test_id,
                responses: formattedResponses
            });
            console.log(response.data.attempt_id);

            // Clear localStorage
            localStorage.removeItem('activeTest');
            localStorage.removeItem('testResponses');
            localStorage.removeItem('testStartTime');

            alert("Test submitted successfully!");

            const evalRes = await axiosInstance.post(`/tests/${test.test_id}/evaluate`);

            if (evalRes.data?.redirect === "upload-key") {
                alert("Answer key not uploaded yet. Redirecting to upload page...");
                return navigate(`/tests/${test.test_id}/upload-key`);
            }

            if (evalRes.data?.score !== undefined) {
                alert(`Your Score: ${evalRes.data.score}/${evalRes.data.max_score}`);
                navigate(`/tests/${response.data.attempt_id}/evaluate/final`);
            } else {
                alert("Evaluation failed. Please check with admin.");
                navigate('/dashboard');
            }

        } catch (err) {
            console.error("Error during submission/evaluation:", err);
            alert("Something went wrong. Please try again.");
        }
    };


    return (
        <div className="test-screen">
            <Timer duration={testData.test_duration} />
            
            <div className="test-body">
                <div className="question-area">
                    <QuestionPanel
                        question={currentQuestion}
                        response={responses[currentQuestion.question_id]}
                        updateResponse={updateResponse}
                    />
                    <NavButtons
                        currentIndex={currentQIndex}
                        setCurrentIndex={setCurrentQIndex}
                        total={testData.questions.length}
                        onSubmit={handleSubmitTest}
                    />
                </div>
                <QuestionNavigator
                    questions={testData.questions}
                    currentIndex={currentQIndex}
                    setCurrentIndex={setCurrentQIndex}
                    responses={responses}
                />
            </div>
        </div>
    );
}
