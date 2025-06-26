import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import QuestionAnalysis from './QuestionAnalysis';
import './FinalEvaluation.css';

export default function FinalEvaluation() {
    const { attempt_id } = useParams();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvaluation = async () => {
            try {
                const res = await axiosInstance.get(`/tests/${attempt_id}/evaluate/final`);

                // Validate response format before setting state
                if (res.data && typeof res.data === 'object') {
                    setSummary(res.data);
                } else {
                    console.error("Unexpected evaluation format:", res.data);
                    alert("Invalid evaluation data received.");
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error("Error fetching evaluation:", err);
                alert("Error fetching evaluation.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluation();
    }, [attempt_id, navigate]);

    if (loading) return <div>Loading Evaluation...</div>;

    if (!summary) return <div>Failed to load evaluation. Please try again later.</div>;

    return (
        <div className="evaluation-container">
            <h2 className="evaluation-title">Final Evaluation</h2>

            <div className="summary-card">
                <p><strong>Total Questions:</strong> {summary.total ?? '-'}</p>
                <p><strong>Correct Answers:</strong> {summary.correct ?? '-'}</p>
                <p><strong>Wrong Answers:</strong> {summary.wrong ?? '-'}</p>
            </div>

            <div className="questions-section">
                {Array.isArray(summary.questions) && summary.questions.length > 0 ? (
                    summary.questions.map(q => (
                        <QuestionAnalysis key={q.question_id} question={q} />
                    ))
                ) : (
                    <p>No question-wise analysis available.</p>
                )}
            </div>
        </div>
    );
}
