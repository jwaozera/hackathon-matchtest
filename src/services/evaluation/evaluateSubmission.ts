import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IScorecardResponse, ISubmissionPayload } from '../../shared/types';
import { buildEvaluationPrompt } from './prompt';
import { scorecardSchema } from './schema';

const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_ATTEMPTS = 2;

const fallbackScorecard = (): IScorecardResponse => ({
  score: {
    hardSkills: 0,
    softSkills: 0,
  },
  details: {
    cleanCode: 'Nao foi possivel avaliar automaticamente o codigo final.',
    communication: 'Nao foi possivel avaliar automaticamente a comunicacao.',
    adaptability: 'Nao foi possivel avaliar automaticamente a adaptabilidade.',
  },
  error: true,
});

const persistSubmission = (payload: ISubmissionPayload, scorecard: IScorecardResponse): void => {
  try {
    localStorage.setItem(
      `submission:${payload.candidateId}`,
      JSON.stringify({
        payload,
        scorecard,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.warn('Could not persist submission locally:', error);
  }
};

const parseModelResponse = (text: string): IScorecardResponse => {
  const parsed: unknown = JSON.parse(text);
  return scorecardSchema.parse(parsed);
};

const requestScorecard = async (payload: ISubmissionPayload): Promise<IScorecardResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }

  // Este client-side key exposure so e aceitavel no MVP porque a chave da demo
  // deve ser restrita e descartavel. Nao reutilizar esse padrao em producao.
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  console.info('[evaluation] Calling Gemini scorecard model', {
    model: MODEL_NAME,
    candidateId: payload.candidateId,
    chatMessages: payload.chatHistory.length,
    finalCodeChars: payload.finalCode.length,
  });

  const result = await model.generateContent(buildEvaluationPrompt(payload));
  return parseModelResponse(result.response.text());
};

export const evaluateSubmission = async (
  payload: ISubmissionPayload,
): Promise<IScorecardResponse> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const scorecard = await requestScorecard(payload);
      console.info('[evaluation] Gemini scorecard validated successfully', {
        candidateId: payload.candidateId,
        hardSkills: scorecard.score.hardSkills,
        softSkills: scorecard.score.softSkills,
      });
      persistSubmission(payload, scorecard);
      return scorecard;
    } catch (error) {
      lastError = error;
      console.warn(`Evaluation attempt ${attempt} failed:`, error);
    }
  }

  console.warn('Evaluation failed after retry, returning fallback scorecard:', lastError);
  const scorecard = fallbackScorecard();
  persistSubmission(payload, scorecard);
  return scorecard;
};
