import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', glass = false, hover = false, onClick }: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  const glassStyles = glass
    ? 'bg-white/60 backdrop-blur-md border border-white/20 shadow-xl'
    : 'bg-white shadow-lg';
  const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
