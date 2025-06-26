import { useEffect, useState } from 'react';
import './QuestionPanel.css';

export default function QuestionPanel({ question, response, updateResponse }) {
    const { question_text, image_url, options, question_id } = question;

    const [selectedOptions, setSelectedOptions] = useState(response?.selected_option_ids || []);

    // Sync local state with parent on mount or question change
    useEffect(() => {
        setSelectedOptions(response?.selected_option_ids || []);
    }, [question_id, response]);

    const handleToggleOption = (option_id) => {
        let updated = [...selectedOptions];

        if (updated.includes(option_id)) {
            updated = updated.filter(id => id !== option_id);
        } else {
            updated.push(option_id);
        }

        setSelectedOptions(updated);                // update local UI
        updateResponse(question_id, updated);       // notify parent
    };

    return (
        <div className="question-panel">
            <div className="question-text">
                <strong>Q{question_id}:</strong> {question_text}
            </div>

            {image_url && (
                <div className="question-image">
                    <img src={image_url} alt="question" />
                </div>
            )}

            <div className="options-list">
                {options.map(opt => (
                    <div key={opt.option_id}
                        className={`option-item ${selectedOptions.includes(opt.option_id) ? 'selected' : ''}`}
                        onClick={() => handleToggleOption(opt.option_id)}
                    >
                        {opt.option_text}
                    </div>
                ))}
            </div>
        </div>
    );
}
