import type { IChatMessage, ISubmissionPayload, IScorecardResponse, IChatRequest, IChatResponse } from '../shared/types';
import { mockChatResponse, mockScorecardResponse } from '../mocks/mockApi';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const sendChatMessage = async (request: IChatRequest): Promise<IChatResponse> => {
  if (USE_MOCKS) {
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
  if (USE_MOCKS) {
    return mockScorecardResponse();
  }

  // Real API integration would go here
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit code');
  }
  
  return response.json();
};
