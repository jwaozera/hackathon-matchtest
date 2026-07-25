import chatResponses from './chatResponses.json';
import scorecardResponse from './scorecardResponse.json';
import type { PersonaType, IScorecardResponse } from '../shared/types';

export const mockChatResponse = async (persona: PersonaType, historyLength: number): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
  
  if (persona === 'candidate') return '';
  
  const responses = chatResponses[persona as keyof typeof chatResponses] || chatResponses.system;
  
  // Pick a response based on some pseudo-randomness using historyLength
  const index = historyLength % responses.length;
  
  return responses[index];
};

export const mockScorecardResponse = async (): Promise<IScorecardResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency for AI evaluation
  return scorecardResponse;
};
