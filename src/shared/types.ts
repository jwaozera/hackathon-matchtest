export type PersonaType = 'system' | 'pm' | 'dev_jr' | 'candidate';

export interface IChatMessage {
  id: string;
  sender: PersonaType;
  content: string;
  timestamp: string;
  avatar?: string;
}

export interface IChatRequest {
  persona: PersonaType;
  history: IChatMessage[];
  currentCode: string;
}

export interface IChatResponse {
  reply: string;
}

export interface ISubmissionPayload {
  candidateId: string;
  finalCode: string;
  chatHistory: IChatMessage[];
  timeRemainingSec: number;
}

export interface IScorecardResponse {
  score: {
    hardSkills: number;
    softSkills: number;
    communication: number;
    adaptability: number;
    productFocus: number;
    overall: number;
  };
  details: {
    hardSkills: string;
    softSkills: string;
    communication: string;
    adaptability: string;
    productFocus: string;
  };
}

export interface IScenarioAct {
  id: number;
  name: string;
  triggerMinute: number;
  persona: PersonaType;
  message: string;
  description: string;
}

export interface IScenario {
  id: string;
  title: string;
  role: string;
  context: string;
  initialCode: string;
  acts: IScenarioAct[];
}
