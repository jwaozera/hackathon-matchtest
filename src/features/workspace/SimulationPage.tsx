import { useState, useCallback, useMemo } from 'react';
import CodeEditor from './CodeEditor';
import Timer from './Timer';
import ContextBar from './ContextBar';
import SubmitModal from './SubmitModal';
import { WelcomeScreen } from './WelcomeScreen';
import ChatPanel from '../chat/ChatPanel';
import scenarioData from '../../data/scenario.json';
import { sendChatMessage, submitCode } from '../../services/apiClient';
import type { IChatMessage, IScenario, IScorecardResponse } from '../../shared/types';
import './SimulationPage.css';

const TOTAL_SECONDS = 15 * 60; // 15 minutes for the simulation

type SimState = 'waiting' | 'running' | 'completed';

// Helper to get the act name from elapsed seconds
function getCurrentActName(elapsedSeconds: number, scenario: IScenario): string {
  const elapsedMinutes = elapsedSeconds / 60;
  let current = '';
  for (const act of scenario.acts) {
    if (elapsedMinutes >= act.triggerMinute) {
      current = act.name;
    }
  }
  return current;
}

export const SimulationPage: React.FC = () => {
  const [simState, setSimState] = useState<SimState>('waiting');
  const [code, setCode] = useState(scenarioData.initialCode);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scorecard, setScorecard] = useState<IScorecardResponse | null>(null);
  const [triggeredActs, setTriggeredActs] = useState<Set<number>>(new Set());

  const scenario = scenarioData as IScenario;

  const elapsedMinutes = useMemo(() => Math.floor(elapsedSeconds / 60), [elapsedSeconds]);

  const currentActName = useMemo(
    () => getCurrentActName(elapsedSeconds, scenario),
    [elapsedSeconds, scenario]
  );

  const timeRemainingFormatted = useMemo(() => {
    const remaining = Math.max(0, TOTAL_SECONDS - elapsedSeconds);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Add a message to the chat
  const addMessage = useCallback((msg: Omit<IChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: IChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  // Scenario trigger logic on timer tick
  const handleTick = useCallback((elapsed: number) => {
    setElapsedSeconds(elapsed);
    const mins = Math.floor(elapsed / 60);

    // Check scenario acts
    for (const act of scenario.acts) {
      if (mins >= act.triggerMinute && !triggeredActs.has(act.id)) {
        setTriggeredActs(prev => {
          const next = new Set(prev);
          next.add(act.id);
          return next;
        });

        // Small delay to feel natural
        const delay = act.triggerMinute === 0 ? 1500 : 800;
        setIsTyping(true);
        setTimeout(() => {
          addMessage({
            sender: act.persona,
            content: act.message,
          });
          setIsTyping(false);
        }, delay);
      }
    }
  }, [scenario.acts, triggeredActs, addMessage]);

  // Handle candidate sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    // Add candidate's message
    addMessage({
      sender: 'candidate',
      content,
    });

    // Get AI response
    setIsTyping(true);
    try {
      const response = await sendChatMessage({
        persona: 'pm', // Default to PM for now, could be smarter
        history: messages,
        currentCode: code,
      });

      // Determine which persona responds based on context
      const lastNonCandidateMsg = [...messages].reverse().find(m => m.sender !== 'candidate');
      const respondingPersona = lastNonCandidateMsg?.sender === 'dev_jr' ? 'dev_jr' : 'pm';

      addMessage({
        sender: respondingPersona,
        content: response.reply,
      });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, messages, code]);

  // Handle simulation start
  const handleStart = useCallback(() => {
    setSimState('running');
    setCode(scenario.initialCode);
    setMessages([]);
    setElapsedSeconds(0);
    setTriggeredActs(new Set());
  }, [scenario.initialCode]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setShowSubmitModal(true);
  }, []);

  // Handle submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const result = await submitCode({
        candidateId: 'demo-candidate',
        finalCode: code,
        chatHistory: messages,
        timeRemainingSec: Math.max(0, TOTAL_SECONDS - elapsedSeconds),
      });
      setScorecard(result);
      setSimState('completed');
      setShowSubmitModal(false);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, messages, elapsedSeconds]);

  // ── Waiting State ──
  if (simState === 'waiting') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // ── Completed State ──
  if (simState === 'completed' && scorecard) {
    return (
      <div className="scorecard-page fade-in">
        <div className="scorecard-container">
          <div className="scorecard-header">
            <span className="scorecard-icon">📊</span>
            <h1 className="scorecard-title">Seu Scorecard</h1>
            <p className="scorecard-subtitle">Análise completa do seu desempenho na simulação</p>
          </div>

          <div className="scorecard-grid">
            <div className="scorecard-card">
              <div className="scorecard-card__label">Hard Skills</div>
              <div className="scorecard-card__score" style={{ color: 'var(--accent-blue)' }}>
                {scorecard.score.hardSkills}
              </div>
              <div className="scorecard-card__detail">{scorecard.details.hardSkills}</div>
            </div>

            <div className="scorecard-card">
              <div className="scorecard-card__label">Comunicação</div>
              <div className="scorecard-card__score" style={{ color: 'var(--accent-green)' }}>
                {scorecard.score.communication}
              </div>
              <div className="scorecard-card__detail">{scorecard.details.communication}</div>
            </div>

            <div className="scorecard-card">
              <div className="scorecard-card__label">Adaptabilidade</div>
              <div className="scorecard-card__score" style={{ color: 'var(--accent-purple)' }}>
                {scorecard.score.adaptability}
              </div>
              <div className="scorecard-card__detail">{scorecard.details.adaptability}</div>
            </div>

            <div className="scorecard-card">
              <div className="scorecard-card__label">Foco no Produto</div>
              <div className="scorecard-card__score" style={{ color: 'var(--accent-orange)' }}>
                {scorecard.score.productFocus}
              </div>
              <div className="scorecard-card__detail">{scorecard.details.productFocus}</div>
            </div>
          </div>

          <div className="scorecard-overall">
            <span className="scorecard-overall__label">Score Geral</span>
            <span className="scorecard-overall__value">{scorecard.score.overall}</span>
            <span className="scorecard-overall__max">/ 100</span>
          </div>

          <button className="scorecard-restart-btn" onClick={() => setSimState('waiting')}>
            ↻ Nova Simulação
          </button>
        </div>
      </div>
    );
  }

  // ── Running State ──
  return (
    <div className="simulation-layout fade-in">
      <header className="simulation-header">
        <ContextBar
          role={scenario.role}
          context={scenario.context}
          currentAct={currentActName}
          isRunning={simState === 'running'}
        />
        <div className="simulation-header__timer">
          <Timer
            totalSeconds={TOTAL_SECONDS}
            isRunning={simState === 'running'}
            onTick={handleTick}
            onTimeUp={handleTimeUp}
          />
          <button
            className="simulation-submit-btn"
            onClick={() => setShowSubmitModal(true)}
          >
            🚀 Enviar
          </button>
        </div>
      </header>

      <main className="simulation-main">
        <div className="simulation-editor-pane">
          <CodeEditor
            code={code}
            onChange={setCode}
            language="typescript"
          />
        </div>

        <div className="simulation-drag-handle" />

        <div className="simulation-chat-pane">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
          />
        </div>
      </main>

      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
        timeRemaining={timeRemainingFormatted}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default SimulationPage;
