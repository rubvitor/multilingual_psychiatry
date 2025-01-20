from fastapi import FastAPI, Query
from pydantic import BaseModel
import openai
import json

app = FastAPI()

openai.api_key = "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"

# Load questions in multiple languages
with open("questions.json", "r") as f:
    questions = json.load(f)

class Responses(BaseModel):
    user_info: dict
    answers: dict
    language: str

@app.get("/questions")
def get_questions(language: str = Query("en", enum=["en", "pt", "es"])):
    return questions.get(language, questions["en"])

@app.post("/analyze")
def analyze_responses(responses: Responses):
    language = responses.language
    prompt = generate_prompt(responses.user_info, responses.answers)
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=1500,
        temperature=0.5
    )
    try:
        analysis = json.loads(response.choices[0].text.strip())
        return translate_analysis(analysis, language)
    except json.JSONDecodeError:
        return {"error": "Failed to process analysis"}

def generate_prompt(user_info, answers):
    return f"""
You are a psychiatric diagnostic system. Below are the user's information and responses:

User Information:
- Age: {user_info['age']}
- Country: {user_info['country']}
- Gender: {user_info['gender']}
- Region: {user_info['region']}
- Ethnicity: {user_info['ethnicity']}

Responses (0 to 10 scale):
{json.dumps(answers, indent=2)}

Task:
1. Analyze the responses for ADHD, Bipolar Disorder, Borderline Personality Disorder, and OCD.
2. Perform cross-analysis to identify more accurate patterns.
3. Return the probabilities for each diagnosis in JSON format.
"""

def translate_analysis(analysis, language):
    translations = {
        "en": {"ADHD": "ADHD", "Bipolar Disorder": "Bipolar Disorder", "Borderline": "Borderline Personality Disorder", "OCD": "Obsessive-Compulsive Disorder"},
        "pt": {"ADHD": "TDAH", "Bipolar Disorder": "Transtorno Bipolar", "Borderline": "Transtorno de Personalidade Borderline", "OCD": "Transtorno Obsessivo-Compulsivo"},
        "es": {"ADHD": "TDAH", "Bipolar Disorder": "Trastorno Bipolar", "Borderline": "Trastorno Límite de la Personalidad", "OCD": "Trastorno Obsesivo-Compulsivo"},
    }
    return {translations[language].get(key, key): value for key, value in analysis.items()}
