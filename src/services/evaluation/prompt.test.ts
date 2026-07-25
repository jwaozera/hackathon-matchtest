import { describe, expect, it } from 'vitest';
import type { ISubmissionPayload } from '../../shared/types';
import { buildEvaluationPrompt } from './prompt';

const payload: ISubmissionPayload = {
  candidateId: 'candidate-1',
  finalCode: 'const solved = true;',
  chatHistory: [
    {
      id: 'message-1',
      sender: 'pm',
      content: 'Consegue priorizar a correcao?',
      timestamp: '2026-07-25T12:00:00.000Z',
    },
    {
      id: 'message-2',
      sender: 'candidate',
      content: 'Sim, vou corrigir sem executar codigo em sandbox.',
      timestamp: '2026-07-25T12:01:00.000Z',
    },
  ],
  timeRemainingSec: 120,
};

describe('buildEvaluationPrompt', () => {
  it('builds a static evaluation prompt with the required scorecard shape', () => {
    const prompt = buildEvaluationPrompt(payload);

    expect(prompt).toContain('Nao execute o codigo.');
    expect(prompt).toContain('"hardSkills": 0');
    expect(prompt).toContain('"softSkills": 0');
    expect(prompt).toContain('"cleanCode": "texto"');
    expect(prompt).toContain('candidateId: candidate-1');
    expect(prompt).toContain('timeRemainingSec: 120');
    expect(prompt).toContain('const solved = true;');
    expect(prompt).toContain('sender: pm');
    expect(prompt).toContain('Consegue priorizar a correcao?');
  });

  it('handles empty chat history explicitly', () => {
    const prompt = buildEvaluationPrompt({ ...payload, chatHistory: [] });

    expect(prompt).toContain('Nenhuma mensagem registrada.');
  });
});
