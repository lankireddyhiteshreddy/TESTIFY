import { useState, useEffect } from 'react';
import './TestInfo.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function TestInfo({ test }) {
    const {user} = useAuth();
    const { test_id, description, test_duration, title ,creator_id} = test;
    const [answerKeyUploaded, setAnswerKeyUploaded] = useState(test.answer_key_uploaded);
    const [isComplete, setIsComplete] = useState(test.is_complete);
    const [isPublic, setIsPublic] = useState(test.is_public);

    const [expanded, setExpanded] = useState(false);
    const [hasOngoingAttempt, setHasOngoingAttempt] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const activeTest = JSON.parse(localStorage.getItem('activeTest'));
        const storedResponses = localStorage.getItem('testResponses');
        const testStartTime = localStorage.getItem('testStartTime');

        if (
            activeTest &&
            parseInt(activeTest.test_id) === parseInt(test_id) &&
            storedResponses &&
            testStartTime
        ) {
            setHasOngoingAttempt(true);
        } else {
            setHasOngoingAttempt(false);
        }
    }, [test_id]);

    const handleStartTest = async () => {
        try {
            const testRes = await axiosInstance.get(`/tests/getTest/${test_id}`);
            const testData = testRes.data;

            const questionsRes = await axiosInstance.get(`/questions/test/${test_id}`);
            const questions = questionsRes.data;

            const fullTest = {
                ...testData,
                questions
            };
            localStorage.setItem('activeTest', JSON.stringify(fullTest));

            const initialResponses = {};
            for (const q of questions) {
                initialResponses[q.question_id] = {
                    selected_option_ids: [],
                    is_marked: false
                };
            }
            localStorage.setItem('testResponses', JSON.stringify(initialResponses));
            localStorage.setItem('testStartTime', Date.now());

            navigate(`/test/live/${test_id}`);
        } catch (err) {
            console.error("Error starting test:", err);
            alert("Failed to start test. Please try again.");
        }
    };

    const handleDeleteTest = async () => {
        if (!window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) return;

        try {
            await axiosInstance.delete(`/tests/${test_id}/delete`);
            alert("Test deleted successfully");
            window.location.reload();
        } catch (err) {
            console.error("Error deleting test:", err);
            alert("Failed to delete test.");
        }
    };

    const handlePublishTest = async () => {
        if (!window.confirm("Are you sure you want to publish this test?")) return;
        try {
            await axiosInstance.post(`/tests/${test_id}/publish`);
            alert("Test published successfully");
            setIsPublic(true); 
        } catch (err) {
            console.error("Error publishing test: ", err);
            alert("Failed to publish test");
        }
    };

    const handleCompileTest = () =>{
        setIsComplete(true);
        navigate(`/tests/compile/${test_id}`)
    }

    const handleViewResults = () =>{
        setAnswerKeyUploaded(true);
        navigate(`/${test_id}/results`);
    }

    const handleEditTest = () =>{
        navigate(`/tests/edit/${test_id}`, { state: { test } });
    }

    const isCreator = parseInt(creator_id) === parseInt(user.user_id);

    return (
        <div className="test-card">
            <div className="expand-section-for-more-info" onClick={() => setExpanded(prev => !prev)}>
                <div className="test-title">{title}</div>

                <div className="testInfo-buttons">
                    {isComplete ? (
                        <>
                            {isCreator && (
                                <>
                                    <button className="submit-button" onClick={handleEditTest}>EDIT</button>
                                    <button className="submit-button" onClick={handleDeleteTest}>DELETE</button>
                                    <button className="submit-button" onClick={() => navigate(`/tests/${test_id}/questions-summary`, { state: { isComplete, test_id } })}>VIEW QUESTIONS</button>
                                    {!isPublic && <button className="submit-button" onClick={handlePublishTest}>PUBLISH</button>}
                                </>
                            )}

                            {hasOngoingAttempt ? (
                                <button className="submit-button" onClick={() => navigate(`/test/live/${test_id}`)}>RESUME TEST</button>
                            ) : (
                                <>
                                    <button className="submit-button" onClick={handleStartTest}>TAKE TEST</button>
                                    <button className="submit-button" onClick={handleViewResults}>VIEW RESULTS</button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {isCreator && (
                                <>
                                    <button className="submit-button" onClick={() => navigate(`/tests/${test_id}/questions-summary`)}>VIEW QUESTIONS</button>
                                    <button className="submit-button" onClick={handleCompileTest}>COMPILE TEST</button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="test-details">
                    <p><strong>Description:</strong> {description || "N/A"}</p>
                    <p><strong>Duration:</strong> {test_duration || "N/A"} mins</p>
                    <p><strong>Key Uploaded:</strong> {answerKeyUploaded ? "Yes" : "No"}</p>
                    <p><strong>Status:</strong> {isComplete ? "Complete" : "Draft"}</p>
                    <p><strong>Visibility:</strong> {isPublic ? "Public" : "Private"}</p>
                </div>
            )}
        </div>
    );
}
