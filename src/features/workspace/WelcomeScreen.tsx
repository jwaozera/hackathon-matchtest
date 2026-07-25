import React from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-background-effect"></div>
      <div className="welcome-content slide-up">
        <h1 className="welcome-title">Sync<span className="welcome-accent">&</span>Solve</h1>
        <h2 className="welcome-subtitle">Simulação de Ambiente de Trabalho</h2>
        <p className="welcome-description">
          Você está prestes a entrar em um ambiente imersivo. Resolva o desafio técnico enquanto interage com a sua nova equipe. Prepare-se.
        </p>
        <button className="welcome-start-button" onClick={onStart}>
          Iniciar Simulação
        </button>
      </div>
    </div>
  );
};
