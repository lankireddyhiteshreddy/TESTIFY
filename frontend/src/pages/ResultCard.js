import './ResultCard.css';
import { useNavigate } from 'react-router-dom';

export default function ResultCard({ result, index, expandedIndex, setExpandedIndex }) {
    const navigate = useNavigate();

    if (!result) return null;

    // Parse detailed_analysis if it's a string
    let analysis = result.detailed_analysis;
    if (typeof analysis === 'string') {
        try {
            analysis = JSON.parse(analysis);
        } catch (e) {
            console.error("Invalid detailed_analysis format:", e);
            return <div className="result-card">Invalid Evaluation Data</div>;
        }
    }

    const handleToggle = () => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className={`result-card ${expandedIndex === index ? 'expanded' : ''}`} onClick={handleToggle}>
            <div className="result-card-header">
                <strong>Attempt : {result.attempt_id}</strong>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/tests/${result.attempt_id}/evaluate/final`); }}>
                    View Detailed Analysis
                </button>
            </div>

            {expandedIndex === index && (
                <div className="result-card-body">
                    <p><strong>Correct:</strong> {analysis?.correct ?? '-'} / {analysis?.total ?? '-'}</p>
                </div>
            )}
        </div>
    );
}
