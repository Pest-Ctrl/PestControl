"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';

const CELL_SIZE = 20;
const DENSITY = 0.15;

export default function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[][]>([]);
  const [running, setRunning] = useState(true);
  const [dimensions, setDimensions] = useState({ rows: 0, cols: 0 });

  const createRandomGrid = useCallback((rows: number, cols: number) => {
    return Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => (Math.random() < DENSITY ? 1 : 0))
    );
  }, []);

  const createEmptyGrid = useCallback((rows: number, cols: number) => {
    return Array(rows).fill(null).map(() => Array(cols).fill(0));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const cols = Math.ceil(window.innerWidth / CELL_SIZE);
      const rows = Math.ceil(window.innerHeight / CELL_SIZE);
      setDimensions({ rows, cols });
      setGrid(createRandomGrid(rows, cols));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [createRandomGrid]);

  const runSimulation = useCallback((currentGrid: number[][]) => {
    if (!running || currentGrid.length === 0) return currentGrid;
    const { rows, cols } = dimensions;
    
    let newGrid = createEmptyGrid(rows, cols);
    let hasChanges = false;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let neighbors = 0;
        const directions = [
          [0, 1], [0, -1], [1, -1], [-1, 1],
          [1, 1], [-1, -1], [1, 0], [-1, 0]
        ];
        
        directions.forEach(([x, y]) => {
          const newR = r + x;
          const newC = c + y;
          if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
            neighbors += currentGrid[newR][newC];
          }
        });
        
        if (currentGrid[r][c] === 1 && (neighbors < 2 || neighbors > 3)) {
          newGrid[r][c] = 0;
          hasChanges = true;
        } else if (currentGrid[r][c] === 0 && neighbors === 3) {
          newGrid[r][c] = 1;
          hasChanges = true;
        } else {
          newGrid[r][c] = currentGrid[r][c];
        }
      }
    }

    if (!hasChanges) {
      newGrid = createRandomGrid(rows, cols);
    }
    
    return newGrid;
  }, [running, dimensions, createEmptyGrid, createRandomGrid]);

  useEffect(() => {
    if (grid.length === 0) return;
    let animationFrameId: number;
    let lastTime = 0;
    
    const render = (time: number) => {
      // Throttle to roughly 5 fps for a slower, calmer background
      if (time - lastTime > 1000 / 5) {
        setGrid(prev => runSimulation(prev));
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [runSimulation, grid.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || grid.length === 0) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cells (no glow, simple styling)
    for (let r = 0; r < dimensions.rows; r++) {
      for (let c = 0; c < dimensions.cols; c++) {
        if (grid[r] && grid[r][c]) {
          ctx.fillStyle = '#1ef2c1';
          ctx.globalAlpha = 0.4; // Increased opacity for background
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }
  }, [grid, dimensions]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
