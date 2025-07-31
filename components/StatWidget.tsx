
import React from 'react';
import Card from './ui/Card';

interface StatWidgetProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

const StatWidget: React.FC<StatWidgetProps> = ({ icon, title, value, subtitle, className }) => {
  return (
    <Card className={`flex items-start ${className}`}>
      <div className="p-3 bg-apple-blue/10 rounded-lg mr-4 text-apple-blue">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-dark-text-secondary mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
};

export default StatWidget;
