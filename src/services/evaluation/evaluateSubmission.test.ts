import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISubmissionPayload } from '../../shared/types';
import { evaluateSubmission } from './evaluateSubmission';

const geminiMock = vi.hoisted(() => {
  return {
    generateContent: vi.fn(),
    getGenerativeModel: vi.fn(),
    GoogleGenerativeAI: vi.fn(),
  };
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: geminiMock.GoogleGenerativeAI,
  };
});

const payload: ISubmissionPayload = {
  candidateId: 'candidate-1',
  finalCode: 'const solved = true;',
  chatHistory: [
    {
      id: 'message-1',
      sender: 'candidate',
      content: 'Vou priorizar a correcao e explicar o tradeoff.',
      timestamp: '2026-07-25T12:00:00.000Z',
    },
  ],
  timeRemainingSec: 60,
};

const validScorecard = {
  score: {
    hardSkills: 88,
    softSkills: 91,
  },
  details: {
    cleanCode: 'Codigo organizado e legivel.',
    communication: 'Comunicacao clara e objetiva.',
    adaptability: 'Adaptou a abordagem ao contexto.',
  },
};

const localStorageMock = () => {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
};

describe('evaluateSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
    vi.stubEnv('VITE_GEMINI_MODEL', 'gemini-2.5-flash');
    vi.stubGlobal('localStorage', localStorageMock());
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    geminiMock.getGenerativeModel.mockReturnValue({
      generateContent: geminiMock.generateContent,
    });
    geminiMock.GoogleGenerativeAI.mockImplementation(function () {
      return {
        getGenerativeModel: geminiMock.getGenerativeModel,
      };
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('calls Gemini with JSON response mode and returns a validated scorecard', async () => {
    geminiMock.generateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(validScorecard),
      },
    });

    const result = await evaluateSubmission(payload);

    expect(result).toEqual(validScorecard);
    expect(geminiMock.GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
    expect(geminiMock.getGenerativeModel).toHaveBeenCalledWith({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
    expect(geminiMock.generateContent).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'submission:candidate-1',
      expect.stringContaining('"scorecard"'),
    );
  });

  it('retries once when the first model response is invalid', async () => {
    geminiMock.generateContent
      .mockResolvedValueOnce({
        response: {
          text: () => '{"score":{"hardSkills":200,"softSkills":50},"details":{}}',
        },
      })
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(validScorecard),
        },
      });

    const result = await evaluateSubmission(payload);

    expect(result).toEqual(validScorecard);
    expect(geminiMock.generateContent).toHaveBeenCalledTimes(2);
  });

  it('returns a fallback scorecard with error true after two failures', async () => {
    geminiMock.generateContent.mockRejectedValue(new Error('Gemini unavailable'));

    const result = await evaluateSubmission(payload);

    expect(result.error).toBe(true);
    expect(result.score).toEqual({
      hardSkills: 0,
      softSkills: 0,
    });
    expect(geminiMock.generateContent).toHaveBeenCalledTimes(2);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'submission:candidate-1',
      expect.stringContaining('"error":true'),
    );
  });
});
