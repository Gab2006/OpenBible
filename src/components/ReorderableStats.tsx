import React from 'react';
import type { StatCardId } from '../types/homeLayoutTypes';

interface ReorderableStatsProps {
  order: StatCardId[];
  setOrder: (newOrder: StatCardId[]) => void;
  isReordering: boolean;
  onEnterReorderMode: () => void;
  renderCard: (id: StatCardId) => React.ReactNode;
}

export const ReorderableStats: React.FC<ReorderableStatsProps> = ({
  order,
  isReordering,
  renderCard
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {order.map(id => (
        <div key={id} className="relative rounded-2xl h-full w-full">
          {/* L'overlay trasparente impedisce interazioni accidentali durante il riordino globale (verticale) */}
          {isReordering && (
            <div className="absolute inset-0 z-40 bg-transparent rounded-2xl" />
          )}
          {renderCard(id)}
        </div>
      ))}
    </div>
  );
};
