import './ContextBar.css';

interface ContextBarProps {
  role: string;
  context: string;
  currentAct?: string;
  isRunning: boolean;
}

export default function ContextBar({ role, context, currentAct, isRunning }: ContextBarProps) {
  return (
    <div className={`context-bar ${isRunning ? 'context-bar--active' : ''}`}>
      <div className="context-bar__left">
        <div className="context-bar__status">
          <span className={`context-bar__dot ${isRunning ? 'context-bar__dot--live' : ''}`} />
          <span className="context-bar__status-text">
            {isRunning ? 'SIMULAÇÃO ATIVA' : 'AGUARDANDO'}
          </span>
        </div>
        <div className="context-bar__role">
          <span className="context-bar__role-icon">💼</span>
          <span className="context-bar__role-text">{role}</span>
        </div>
      </div>
      <div className="context-bar__center">
        <p className="context-bar__context">{context}</p>
      </div>
      {currentAct && (
        <div className="context-bar__right">
          <div className="context-bar__act-badge">
            <span className="context-bar__act-icon">📋</span>
            <span className="context-bar__act-text">{currentAct}</span>
          </div>
        </div>
      )}
    </div>
  );
}
