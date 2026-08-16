import React, { useRef } from 'react';
import { Reorder } from 'framer-motion';
import type { HomeCardId } from '../types/homeLayoutTypes';

interface ReorderableHomeProps {
  order: HomeCardId[];
  setOrder: (newOrder: HomeCardId[]) => void;
  isReordering: boolean;
  onEnterReorderMode: () => void;
  renderCard: (id: HomeCardId) => React.ReactNode;
}

export const ReorderableHome: React.FC<ReorderableHomeProps> = ({
  order,
  setOrder,
  isReordering,
  onEnterReorderMode,
  renderCard
}) => {
  return (
    <Reorder.Group 
      axis="y" 
      values={order} 
      onReorder={setOrder} 
      className="space-y-6"
    >
      {order.map(id => (
        <ReorderableItem 
          key={id} 
          id={id} 
          isReordering={isReordering} 
          onEnterReorderMode={onEnterReorderMode}
        >
          {renderCard(id)}
        </ReorderableItem>
      ))}
    </Reorder.Group>
  );
};

interface ReorderableItemProps {
  id: string;
  isReordering: boolean;
  onEnterReorderMode: () => void;
  children: React.ReactNode;
}

const ReorderableItem: React.FC<ReorderableItemProps> = ({ 
  id, 
  isReordering, 
  onEnterReorderMode, 
  children 
}) => {
  const timeoutRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReordering) return;
    // Don't trigger on right click
    if (e.button !== 0) return;
    
    timeoutRef.current = window.setTimeout(() => {
      onEnterReorderMode();
    }, 500); // 500ms long press
  };

  const cancelLongPress = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <Reorder.Item 
      value={id} 
      id={id}
      data-reorderable="true"
      drag="y"
      dragListener={isReordering}
      className={`relative rounded-3xl ${isReordering ? 'cursor-grab' : ''}`}
      style={{ 
        touchAction: isReordering ? 'none' : 'auto',
        WebkitUserSelect: isReordering ? 'none' : 'auto',
        userSelect: isReordering ? 'none' : 'auto'
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelLongPress}
      onPointerMove={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerCancel={cancelLongPress}
      whileDrag={{ scale: 1.05, zIndex: 50, opacity: 0.95, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.15)" }}
    >
      {/* Overlay to block clicks on internal elements during reordering */}
      {isReordering && (
        <div className="absolute inset-0 z-40 bg-transparent rounded-3xl" />
      )}
      {children}
    </Reorder.Item>
  );
};
