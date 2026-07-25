import { z } from 'zod';

export const scorecardSchema = z
  .object({
    score: z
      .object({
        hardSkills: z.number().min(0).max(100),
        softSkills: z.number().min(0).max(100),
      })
      .strict(),
    details: z
      .object({
        cleanCode: z.string().min(1),
        communication: z.string().min(1),
        adaptability: z.string().min(1),
      })
      .strict(),
  })
  .strict();
