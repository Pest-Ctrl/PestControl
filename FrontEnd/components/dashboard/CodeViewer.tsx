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
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeAnchor, setRangeAnchor] = useState<number | null>(null);
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
    if (rangeMode) {
      if (rangeAnchor === null) {
        setRangeAnchor(lineNumber);
        setStartLine(lineNumber);
        setEndLine(lineNumber);
      } else {
        setStartLine(rangeAnchor);
        setEndLine(lineNumber);
        notifyChange(rangeAnchor, lineNumber);
        setRangeAnchor(null);
      }
      return;
    }
    setStartLine(lineNumber);
    setEndLine(lineNumber);
    setIsDragging(true);
  };

  const handleMouseEnter = (lineNumber: number) => {
    if (!rangeMode && isDragging && startLine !== null) {
      setEndLine(lineNumber);
    }
  };

  const handleMouseUp = () => {
    if (!rangeMode && isDragging && startLine !== null && endLine !== null) {
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
  }, [isDragging, startLine, endLine, rangeMode]);

  if (loading) {
    return (
      <div className="w-full h-56 sm:h-64 bg-[#050505] border border-zinc-800 rounded-lg flex items-center justify-center">
        <div className="text-zinc-500 text-sm animate-pulse">Loading file contents...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="w-full h-56 sm:h-64 bg-[#050505] border border-zinc-800 rounded-lg flex items-center justify-center">
        <div className="text-zinc-500 text-sm italic">No content to display.</div>
      </div>
    );
  }

  const lines = content.split('\n');
  const actualStart = startLine !== null && endLine !== null ? Math.min(startLine, endLine) : -1;
  const actualEnd = startLine !== null && endLine !== null ? Math.max(startLine, endLine) : -1;

  return (
    <div className="w-full bg-[#050505] border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-[#0a0a0a] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-zinc-500">
          {rangeMode
            ? rangeAnchor !== null
              ? `Tap end line (start: ${rangeAnchor})`
              : "Tap start line"
            : actualStart > 0
            ? `Selected: ${actualStart === actualEnd ? `Line ${actualStart}` : `Lines ${actualStart}-${actualEnd}`}`
            : "Drag or enable Tap Range to select lines"}
        </span>
        <button
          type="button"
          onClick={() => {
            setRangeMode((prev) => !prev);
            setRangeAnchor(null);
          }}
          className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            rangeMode
              ? 'bg-[#1ef2c1]/15 text-[#1ef2c1] border-[#1ef2c1]/40'
              : 'text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          {rangeMode ? 'Tap Range: On' : 'Tap Range'}
        </button>
      </div>
      <div 
        className="w-full overflow-auto max-h-[380px] sm:max-h-[500px] custom-scrollbar font-mono text-xs relative select-text"
        ref={containerRef}
        onMouseLeave={() => isDragging && handleMouseUp()}
      >
        <div className="min-w-full inline-block py-3">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isSelected = lineNum >= actualStart && lineNum <= actualEnd;
            return (
              <div
                key={lineNum}
                className={`flex items-stretch min-w-full transition-colors cursor-pointer group ${
                  isSelected ? 'bg-[#1ef2c1]/15 text-[#1ef2c1]' : 'hover:bg-zinc-900/60 text-zinc-300'
                }`}
                onMouseDown={() => handleMouseDown(lineNum)}
                onMouseEnter={() => handleMouseEnter(lineNum)}
              >
                <div
                  className={`sticky left-0 flex-none w-10 sm:w-12 px-2 sm:px-3 text-right select-none bg-[#0a0a0a] border-r border-zinc-800 transition-colors z-10 ${
                    isSelected ? 'text-[#1ef2c1] font-bold bg-[#0d1412]' : 'text-zinc-600 group-hover:text-zinc-400'
                  }`}
                >
                  {lineNum}
                </div>
                <div className="flex-1 px-3 sm:px-4 whitespace-pre font-mono leading-relaxed">
                  {line || ' '}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
