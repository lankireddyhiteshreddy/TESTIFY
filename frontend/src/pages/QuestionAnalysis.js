import './QuestionAnalysis.css';

export default function QuestionAnalysis({ question }) {

    const options = Array.isArray(question.options) ? question.options : [];

    return (
        <div className="question-analysis">
            <h4 className="question-text">{question.question_text || `Question ID: ${question.question_id}`}</h4>
            
            <ul className="options-list">
                {options.length > 0 ? (
                    options.map(opt => {
                        let className = "option-item";
                        if (opt.is_marked_by_user && opt.is_correct) className += " correct-marked";
                        else if (opt.is_marked_by_user && !opt.is_correct) className += " wrong-marked";
                        else if (!opt.is_marked_by_user && opt.is_correct) className += " correct-unmarked";

                        return (
                            <li key={opt.option_id} className={className}>
                                <input
                                    type="checkbox"
                                    checked={opt.is_marked_by_user}
                                    readOnly
                                    className="mr-2"
                                />
                                {opt.option_text}
                            </li>
                        );
                    })
                ) : (
                    <li>No options available</li>
                )}
            </ul>
        </div>
    );
}
