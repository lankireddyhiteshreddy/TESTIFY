// src/components/NavButtons.jsx
import './NavButtons.css';

export default function NavButtons({ currentIndex, setCurrentIndex, total, onSubmit }) {
    return (
        <div className="nav-buttons">
            <button
                onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
            >
                Previous
            </button>

            <button
                onClick={() => setCurrentIndex(prev => Math.min(prev + 1, total - 1))}
                disabled={currentIndex === total - 1}
            >
                Next
            </button>

            <button onClick={onSubmit} className="submit-btn">
                Submit Test
            </button>
        </div>
    );
}
