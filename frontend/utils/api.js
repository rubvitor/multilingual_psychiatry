export const fetchQuestions = async (language) => {
    const response = await fetch(`http://localhost:8000/questions?language=${language}`);
    return response.json();
};

export const sendResponses = async (data) => {
    const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const detectLanguage = async () => {
    try {
        const response = await fetch('http://ip-api.com/json');
        const data = await response.json();
        const countryCode = data.countryCode;

        // Map country codes to languages
        const languageMapping = {
            PT: 'pt', // Portugal, Brazil
            BR: 'pt', // Brazil
            ES: 'es', // Spain
            MX: 'es', // Mexico
            AR: 'es', // Argentina
            CL: 'es', // Chile
            CO: 'es', // Colombia
        };

        return languageMapping[countryCode] || 'en'; // Default to English
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en'; // Fallback to English in case of error
    }
};
