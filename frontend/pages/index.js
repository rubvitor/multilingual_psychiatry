import React, { useState, useEffect } from 'react';
import { fetchQuestions, sendResponses, detectLanguage } from '../utils/api';

export default function Home() {
    const [language, setLanguage] = useState('en'); // Default language is English
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false); // Loader state
    const [step, setStep] = useState(1);

    // Detect language automatically on page load
    useEffect(() => {
        const initializeLanguage = async () => {
            const detectedLang = await detectLanguage();
            setLanguage(detectedLang);
        };
        initializeLanguage();
    }, []);

    const startQuiz = async () => {
        setLoading(true); // Show loader when fetching questions
        const data = await fetchQuestions(language);
        setQuestions(data);
        setLoading(false); // Hide loader
        setStep(2);
    };

    const submitAnswers = async () => {
        setLoading(true); // Show loader when sending answers
        const response = await sendResponses({ language, answers });
        setResults(response);
        setLoading(false); // Hide loader
        setStep(3);
    };

    return (
        <div>
            <h1>Psychiatric Diagnosis System</h1>
            <p>Detected Language: {language.toUpperCase()}</p>
            {step === 1 && (
                <div>
                    <button onClick={startQuiz}>Start Quiz</button>
                </div>
            )}
            {loading && <p>Loading...</p>}
            {step === 2 && !loading && (
                <div>
                    <h2>Questionnaire</h2>
                    {questions.map((q) => (
                        <div key={q.id}>
                            <p>{q.text}</p>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            />
                        </div>
                    ))}
                    <button onClick={submitAnswers}>Submit Answers</button>
                </div>
            )}
            {step === 3 && !loading && results && (
                <div>
                    <h2>Results</h2>
                    <ul>
                        {Object.entries(results).map(([key, value]) => (
                            <li key={key}>{key}: {value}%</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
