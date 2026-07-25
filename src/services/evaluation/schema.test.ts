import { describe, expect, it } from 'vitest';
import { scorecardSchema } from './schema';

describe('scorecardSchema', () => {
  it('accepts the required scorecard contract', () => {
    const scorecard = {
      score: {
        hardSkills: 80,
        softSkills: 75,
      },
      details: {
        cleanCode: 'Codigo claro e organizado.',
        communication: 'Comunicou decisoes de forma objetiva.',
        adaptability: 'Ajustou a solucao diante das mudancas.',
      },
    };

    expect(scorecardSchema.parse(scorecard)).toEqual(scorecard);
  });

  it('rejects scores outside the 0 to 100 range', () => {
    const result = scorecardSchema.safeParse({
      score: {
        hardSkills: 101,
        softSkills: 75,
      },
      details: {
        cleanCode: 'Codigo claro.',
        communication: 'Boa comunicacao.',
        adaptability: 'Boa adaptabilidade.',
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects extra fields returned by the model', () => {
    const result = scorecardSchema.safeParse({
      score: {
        hardSkills: 80,
        softSkills: 75,
        overall: 78,
      },
      details: {
        cleanCode: 'Codigo claro.',
        communication: 'Boa comunicacao.',
        adaptability: 'Boa adaptabilidade.',
      },
    });

    expect(result.success).toBe(false);
  });
});
