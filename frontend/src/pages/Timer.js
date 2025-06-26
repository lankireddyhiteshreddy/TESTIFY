import { useEffect, useState } from 'react';
import './Timer.css';

export default function Timer({ duration, onTimeout }) {
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        // Get or set test start time
        let startTime = localStorage.getItem('testStartTime');
        if (!startTime) {
            startTime = Date.now();
            localStorage.setItem('testStartTime', startTime);
        } else {
            startTime = parseInt(startTime);
        }

        const durationSeconds = duration * 60;

        const updateTime = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = durationSeconds - elapsed;

            if (remaining <= 0) {
                setSecondsLeft(0);
                onTimeout();
            } else {
                setSecondsLeft(remaining);
            }
        };

        updateTime(); // initial call
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, [duration, onTimeout]);

    const formatTime = (secs) => {
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };


    return (
        <div className="timer">
            Time Left: {formatTime(secondsLeft)}
        </div>
    );
}
