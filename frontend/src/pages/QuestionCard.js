import { useState } from 'react';
import './QuestionCard.css';

const QuestionCard = ({ question, index, expandedIndex, setExpandedIndex, onDelete, onEdit }) => {
    const [showPreview, setShowPreview] = useState(false);

    const handleToggle = () => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className={`question-card ${expandedIndex === index ? 'expanded' : ''}`}>
            <div className="question-card-header" onClick={handleToggle}>
                <strong>QUESTION {question.questionNumber}</strong>
                <div className="button-group">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(index); }}>EDIT</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(index); }}>DELETE</button>
                </div>
            </div>

            {expandedIndex === index && (
                <div className="question-card-body">
                    <p>{question.questionText}</p>

                    {question.image && (
                        <>
                            <img
                                src={question.image}
                                alt="question"
                                className="question-card-image"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPreview(true);
                                }}
                            />
                            {showPreview && (
                                <div className="image-overlay" onClick={() => setShowPreview(false)}>
                                    <img
                                        src={question.image}
                                        alt="Full Preview"
                                        className="full-image"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
                                </div>
                            )}
                        </>
                    )}

                    <ul>
                        {question.options.map((opt, i) => (
                            <li key={i}>{opt}</li>
                        ))}
                    </ul>

                    {question.correctOption && (
                        <p><strong>Correct Option:</strong> {question.correctOption}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
