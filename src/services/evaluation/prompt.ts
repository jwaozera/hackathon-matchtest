import type { ISubmissionPayload } from '../../shared/types';

const formatChatHistory = (payload: ISubmissionPayload): string => {
  if (payload.chatHistory.length === 0) {
    return 'Nenhuma mensagem registrada.';
  }

  return payload.chatHistory
    .map((message, index) => {
      return [
        `#${index + 1}`,
        `sender: ${message.sender}`,
        `timestamp: ${message.timestamp}`,
        `content: ${message.content}`,
      ].join('\n');
    })
    .join('\n\n');
};

export const buildEvaluationPrompt = (payload: ISubmissionPayload): string => {
  return `
Voce e um avaliador tecnico do MVP Sync&Solve. Avalie estaticamente a submissao final de um candidato em uma simulacao de hackathon.

Regras:
- Nao execute o codigo.
- Avalie o codigo final por leitura estatica: clareza, organizacao, legibilidade, manutencao, risco de bugs e se a solucao parece resolver o problema apresentado.
- Avalie o historico de chat: comunicacao com PM e Dev Junior, clareza, respeito, objetividade, colaboracao e adaptabilidade a mudancas.
- Retorne somente JSON valido, sem Markdown, sem comentarios e sem texto fora do JSON.
- Use notas numericas de 0 a 100.
- "hardSkills" deve refletir a qualidade tecnica do codigo e a plausibilidade da solucao.
- "softSkills" deve refletir comunicacao, colaboracao e adaptabilidade observadas no chat.
- As explicacoes em "details" devem ser curtas, especificas e em portugues do Brasil.

Formato obrigatorio:
{
  "score": {
    "hardSkills": 0,
    "softSkills": 0
  },
  "details": {
    "cleanCode": "texto",
    "communication": "texto",
    "adaptability": "texto"
  }
}

Dados da submissao:
candidateId: ${payload.candidateId}
timeRemainingSec: ${payload.timeRemainingSec}

Codigo final:
\`\`\`typescript
${payload.finalCode}
\`\`\`

Historico de chat:
${formatChatHistory(payload)}
`.trim();
};
