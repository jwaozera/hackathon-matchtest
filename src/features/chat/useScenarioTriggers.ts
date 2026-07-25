import { useEffect, useState } from 'react';
import type { IScenario, IChatMessage } from '../../shared/types';

export const useScenarioTriggers = (
  scenario: IScenario | null | undefined,
  elapsedMinutes: number,
  addMessage: (msg: Omit<IChatMessage, 'id' | 'timestamp'>) => void
) => {
  const [triggeredActs, setTriggeredActs] = useState<string[]>([]);

  useEffect(() => {
    if (!scenario || !scenario.acts) return;

    scenario.acts.forEach((act: any) => {
      if (
        elapsedMinutes >= act.triggerTimeMinutes &&
        !triggeredActs.includes(act.id)
      ) {
        setTriggeredActs((prev) => [...prev, act.id]);
        
        act.messages?.forEach((msg: any, index: number) => {
          setTimeout(() => {
            addMessage({
              // We assume msg has senderId/sender and content
              ...msg
            });
          }, index * 1500);
        });
      }
    });
  }, [scenario, elapsedMinutes, triggeredActs, addMessage]);

  return triggeredActs;
};

export default useScenarioTriggers;
