import React, { useState, useEffect, useRef } from 'react';

interface CodeViewerProps {
  content: string;
  selectedRange?: string; // e.g. "42-58"
  onRangeSelect?: (range: string) => void;
  language?: string;
  loading?: boolean;
}

export default function CodeViewer({ content, selectedRange, onRangeSelect, language, loading }: CodeViewerProps) {
  const [startLine, setStartLine] = useState<number | null>(null);
  const [endLine, setEndLine] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse external selectedRange prop
  useEffect(() => {
    if (selectedRange) {
      const parts = selectedRange.split('-');
      if (parts.length === 2) {
        setStartLine(parseInt(parts[0]));
        setEndLine(parseInt(parts[1]));
      } else if (parts.length === 1 && parts[0]) {
        setStartLine(parseInt(parts[0]));
        setEndLine(parseInt(parts[0]));
      }
    } else {
      setStartLine(null);
      setEndLine(null);
    }
  }, [selectedRange]);

  const notifyChange = (start: number, end: number) => {
    if (onRangeSelect) {
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      onRangeSelect(min === max ? `${min}` : `${min}-${max}`);
    }
  };

  const handleMouseDown = (lineNumber: number) => {
    setStartLine(lineNumber);
    setEndLine(lineNumber);
    setIsDragging(true);
  };

  const handleMouseEnter = (lineNumber: number) => {
    if (isDragging && startLine !== null) {
      setEndLine(lineNumber);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && startLine !== null && endLine !== null) {
      notifyChange(startLine, endLine);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, startLine, endLine]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-[#050505] border border-zinc-800 rounded-lg flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">Loading file contents...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="w-full h-64 bg-[#050505] border border-zinc-800 rounded-lg flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm italic">No content to display.</div>
      </div>
    );
  }

  const lines = content.split('\n');
  const actualStart = startLine !== null && endLine !== null ? Math.min(startLine, endLine) : -1;
  const actualEnd = startLine !== null && endLine !== null ? Math.max(startLine, endLine) : -1;

  return (
    <div 
      className="w-full bg-[#050505] border border-zinc-800 rounded-lg overflow-hidden flex font-mono text-sm"
      ref={containerRef}
      onMouseLeave={() => isDragging && handleMouseUp()}
    >
      <div className="flex-none bg-[#0a0a0a] border-r border-zinc-800 text-right select-none py-4 w-12 custom-scrollbar overflow-y-hidden">
        {lines.map((_, i) => {
          const lineNum = i + 1;
          const isSelected = lineNum >= actualStart && lineNum <= actualEnd;
          return (
            <div 
              key={lineNum}
              className={`px-2 cursor-ns-resize transition-colors ${isSelected ? 'text-[#1ef2c1] font-bold' : 'text-zinc-600 hover:text-zinc-400'}`}
              onMouseDown={() => handleMouseDown(lineNum)}
              onMouseEnter={() => handleMouseEnter(lineNum)}
            >
              {lineNum}
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-auto py-4 custom-scrollbar max-h-[500px]">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isSelected = lineNum >= actualStart && lineNum <= actualEnd;
          return (
            <div 
              key={lineNum}
              className={`px-4 whitespace-pre transition-colors min-w-full ${isSelected ? 'bg-[#1ef2c1]/10 text-[#1ef2c1]' : 'text-zinc-300'}`}
              onMouseDown={() => handleMouseDown(lineNum)}
              onMouseEnter={() => handleMouseEnter(lineNum)}
            >
              {line || ' '}
            </div>
          );
        })}
      </div>
    </div>
  );
}
