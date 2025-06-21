import React from 'react';
import { GoalItem } from './GoalItem';

export function Goals({ goals, darkMode, onToggle, onDelete, onUpdate }) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Цели/смены</h2>
      {goals.length === 0 ? (
        <div className="p-8 text-center bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">Нет поставленных целей. Начните планировать!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <GoalItem
              key={index}
              goal={goal}
              index={index}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={(updatedGoal) => onUpdate(updatedGoal, index)}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </section>
  );
} 