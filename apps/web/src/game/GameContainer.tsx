import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameLoop } from './GameLoop';
import { Player, Direction, Score, ReplayRecorder } from '@celo-atari-games/stable-sprint-engine';
import type { FrameInput } from '@celo-atari-games/stable-sprint-engine';
import { CanvasRenderer } from './CanvasRenderer';

interface GameContainerProps {
  onGameOver: (score: number, replayInputs: FrameInput[]) => void;
  seed?: number;
}

export const GameContainer: React.FC<GameContainerProps> = ({ onGameOver, seed = 12345 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameOverScore, setGameOverScore] = useState<number | null>(null);

  const gameRef = useRef<{
    player: Player;
    scoreObj: Score;
  } | null>(null);

  const gameState = useRef<{
    loop: GameLoop | null;
    recorder: ReplayRecorder | null;
  }>({
    loop: null,
    recorder: null,
  });

  const handleInput = useCallback((dir: Direction) => {
    const player = gameRef.current?.player;
    const recorder = gameState.current.recorder;
    if (player && recorder && gameOverScore === null) {
      player.setDirection(dir);
      recorder.recordInput(dir);
    }
  }, [gameOverScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case ' ': // Spacebar jumps
          e.preventDefault();
          handleInput(Direction.UP);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleInput(Direction.DOWN);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleInput]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const recorder = new ReplayRecorder();
    const renderer = new CanvasRenderer(canvasRef.current);
    let isOver = false;

    const player = new Player();
    const scoreObj = new Score(seed);

    gameRef.current = { player, scoreObj };
    setCurrentLevel(1);
    setCurrentScore(0);

    const update = (_dt: number) => {
      if (isOver || !gameRef.current) return;
      const state = gameRef.current;

      recorder.tick();
      state.player.update();
      isOver = state.scoreObj.update(state.player);

      setCurrentScore(state.scoreObj.current);
      setCurrentLevel(state.scoreObj.level);

      if (isOver) {
        setGameOverScore(state.scoreObj.current);
        onGameOver(state.scoreObj.current, recorder.getInputs());
      }
    };

    const draw = () => {
      if (!gameRef.current) return;
      const s = gameRef.current;
      renderer.draw(s.player, s.scoreObj, isOver);
    };

    const loop = new GameLoop(update, draw);
    gameState.current = { loop, recorder };
    loop.start();

    return () => {
      loop.stop();
    };
  }, [seed, onGameOver]);

  const handleTouch = (dir: Direction) => () => handleInput(dir);

  const dpadBtnClass = "bg-[#1a1024] border-2 border-[#2d2440] p-4 rounded-md font-bold text-xs text-cream flex items-center justify-center min-h-[60px] transition-all active:bg-primary active:border-primary active:text-secondary uppercase tracking-wider";
  const dpadStyle = { boxShadow: '0 4px 0 #0a0614' };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto relative p-4" ref={containerRef}>
      {/* HUD */}
      <div className="flex justify-between w-full mb-3 px-1">
        <div className="hw-chip flex items-center gap-2 text-xs">
          <span className="text-[#655947]">DISTANCE</span>
          <span className="text-primary font-bold font-mono">{currentScore}</span>
        </div>
        <div className="hw-chip flex items-center gap-2 text-xs">
          <span className="text-[#655947]">STAGE</span>
          <span className="text-secondary font-bold font-mono">{currentLevel}</span>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative overflow-hidden border-2 border-[#2d2440] rounded bg-[#120b1a]"
        style={{ boxShadow: 'inset 0 0 20px rgba(30,0,43,0.5), 0 8px 0 #0a0614' }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}
        />

        {gameOverScore !== null && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <h2 className="pixel-subtitle text-cream mb-3" style={{ textShadow: '2px 2px 0 #476520', color: '#FCF6F1' }}>
              LIQUIDATED
            </h2>
            <p className="font-arcade text-2xl text-primary mb-6" style={{ textShadow: '2px 2px 0 #476520', fontSmooth: 'never', WebkitFontSmoothing: 'none' }}>{gameOverScore}</p>
            <p className="text-[#655947] text-xs font-mono">Game Over. Press START to try again.</p>
          </div>
        )}
      </div>

      {/* Mobile controls: Jump and Slide */}
      <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-xs mx-auto md:hidden pb-8">
        <button
          className={`${dpadBtnClass} bg-primary text-secondary border-primary`}
          style={{ ...dpadStyle, boxShadow: '0 4px 0 #8a8c1a' }}
          onClick={handleTouch(Direction.UP)}
        >
          🛩 JUMP
        </button>
        <button
          className={dpadBtnClass}
          style={dpadStyle}
          onClick={handleTouch(Direction.DOWN)}
        >
          ⬇ SLIDE
        </button>
      </div>
    </div>
  );
};
