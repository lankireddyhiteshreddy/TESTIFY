// src/components/QuestionNavigator.jsx
import './QuestionNavigator.css';

export default function QuestionNavigator({ questions, currentIndex, setCurrentIndex, responses }) {
    return (
        <div className="question-navigator">
            <h3>Questions</h3>
            <div className="navigator-grid">
                {questions.map((q, index) => {
                    const isActive = index === currentIndex;
                    const isAnswered = responses[q.question_id]?.selected_option_ids?.length > 0;

                    let btnClass = "navigator-button";
                    if (isActive) btnClass += " active";
                    else if (isAnswered) btnClass += " answered";

                    return (
                        <button
                            key={q.question_id}
                            className={btnClass}
                            onClick={() => setCurrentIndex(index)}
                        >
                            {q.question_id}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
