import type { ISubmissionPayload, IScorecardResponse, IChatRequest, IChatResponse } from '../shared/types';
import { mockChatResponse, mockScorecardResponse } from '../mocks/mockApi';
import { evaluateSubmission } from './evaluation';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const USE_CHAT_MOCKS = import.meta.env.VITE_USE_CHAT_MOCKS !== 'false';
const USE_EVALUATION_MOCKS = import.meta.env.VITE_USE_EVALUATION_MOCKS
  ? import.meta.env.VITE_USE_EVALUATION_MOCKS !== 'false'
  : USE_MOCKS;

export const sendChatMessage = async (request: IChatRequest): Promise<IChatResponse> => {
  if (USE_CHAT_MOCKS) {
    const reply = await mockChatResponse(request.persona, request.history.length);
    return { reply };
  }

  // Real API integration would go here
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
};

export const submitCode = async (payload: ISubmissionPayload): Promise<IScorecardResponse> => {
  if (USE_EVALUATION_MOCKS) {
    return mockScorecardResponse();
  }

  return evaluateSubmission(payload);
};
