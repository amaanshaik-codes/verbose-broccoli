
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-dark-card rounded-2xl shadow-sm p-6 transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
