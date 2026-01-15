import { useState, useRef, useEffect, type ReactNode } from 'react';

interface DraggableProps {
  children: ReactNode;
  initialX?: number;
  initialY?: number;
  handleSelector?: string; // CSS selector for the drag handle
  onDragEnd?: (x: number, y: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Draggable({ 
  children, 
  initialX = 0, 
  initialY = 0, 
  handleSelector,
  onDragEnd,
  className = '',
  style = {}
}: DraggableProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync with external initial changes if needed, but usually not desirable
    // setPosition({ x: initialX, y: initialY });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow dragging if the target matches the handle selector (if provided)
    if (handleSelector) {
      const target = e.target as HTMLElement;
      if (!target.closest(handleSelector)) return;
    }

    e.preventDefault();
    // Allow text selection in content if dragging from handle
    // if (!handleSelector) e.preventDefault(); 
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    // Capture pointer to handle dragging even if cursor leaves the element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    // Optional: Add bounds checking here
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    onDragEnd?.(position.x, position.y);
  };

  return (
    <div
      ref={elementRef}
      className={`draggable ${className}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        touchAction: 'none', // Prevent scrolling on mobile while dragging
        zIndex: isDragging ? 1600 : undefined, // Bring to front while dragging
        ...style
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {children}
    </div>
  );
}
