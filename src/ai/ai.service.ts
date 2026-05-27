import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  // ==================== NOTE SUMMARIZER ====================
  async summarizeNotes(content: string) {
    const prompt = `
You are a study assistant. Summarize the following study notes.

Return your response in this exact JSON format:
{
  "summary": "A concise 3-5 sentence summary of the content",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "flashcards": [
    { "question": "Question 1", "answer": "Answer 1" },
    { "question": "Question 2", "answer": "Answer 2" },
    { "question": "Question 3", "answer": "Answer 3" }
  ]
}

Here are the notes to summarize:
${content}
`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    const text = response.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      summary: text,
      keyPoints: [],
      flashcards: [],
    };
  }

  // ==================== QUIZ GENERATOR ====================
  async generateQuiz(content: string, numberOfQuestions: number = 5) {
    const prompt = `
You are a quiz generator. Create a quiz based on the following content.

Return your response in this exact JSON format:
{
  "questions": [
    {
      "question": "What is...?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "B",
      "explanation": "Explanation of why B is correct"
    }
  ]
}

Generate exactly ${numberOfQuestions} multiple-choice questions.
Content:
${content}
`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    const text = response.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { questions: [] };
  }

  // ==================== STUDY ASSISTANT ====================
  async studyAssistant(question: string, context?: string) {
    const systemPrompt = `You are a helpful study assistant for university and polytechnic students. 
Explain concepts clearly, use examples, and keep answers educational.
${context ? `Use this context to answer: ${context}` : ''}`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: `${systemPrompt}\n\nStudent Question: ${question}`,
    });

    return {
      answer: response.text || 'Sorry, I could not generate a response.',
    };
  }
}