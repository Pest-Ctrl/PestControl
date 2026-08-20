import React, { ReactNode } from 'react';

interface ScrollableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Scrollable({ children, className = '', ...props }: ScrollableProps) {
  return (
    <div className={`custom-scrollbar overflow-y-auto ${className}`} {...props}>
      {children}
    </div>
  );
}
