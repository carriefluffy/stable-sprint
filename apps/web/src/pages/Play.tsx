import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { GameContainer } from '../game/GameContainer';
import { useGame } from '../hooks/useGame';
import { useWallet } from '../hooks/useWallet';
import { Panel } from '../components/Card';
import { Button, buttonClass } from '../components/Button';
import { Badge, type BadgeStatus } from '../components/Badge';
import { ArcticonsEmojiAlienMonster } from '@/components/icons/arcticons/emoji-alien-monster';
import { ArcticonsBlockBuster } from '@/components/icons/arcticons/block-buster';
import { ArcticonsTrexrunner } from '@/components/icons/arcticons/trexrunner';
import { ArcticonsControlloid } from '@/components/icons/arcticons/controlloid';

const EXPLORER_URL = 'https://celoscan.io/tx/';

interface GameInfo {
  name: string;
  desc: string;
  time: string;
  type: string;
  status: BadgeStatus;
  scores: { name: string; score: number }[];
}

const GAME_INFO: Record<string, GameInfo> = {
  'stable-sprint': {
    name: 'Stable Sprint',
    desc: 'Collect cUSD coins while dodging volatility traps. Endless runner speed test.',
    time: '45s',
    type: 'ON-CHAIN',
    status: 'beta',
    scores: [
      { name: 'FLASH_RUNNER', score: 3200 },
      { name: 'COIN_COLLECTOR', score: 2800 },
      { name: 'CUSD_DASH', score: 2400 },
    ],
  },
  'gas-gobbler': {
    name: 'Gas Gobbler',
    desc: 'Dodge barriers and gobble all gas orbs to advance. Points are saved directly to the Celo blockchain.',
    time: 'CLEANSING',
    type: 'ON-CHAIN',
    status: 'live',
    scores: [
      { name: 'CRYPTO_KING', score: 1540 },
      { name: 'MINI_PAY_MAV', score: 1200 },
      { name: 'GAS_GUZZLER', score: 1080 },
    ],
  },
  'mento-invaders': {
    name: 'Mento Invaders',
    desc: 'Defend the stablecoin pool from incoming anomalies. Classical space shooter survival mode.',
    time: 'SURVIVAL',
    type: 'ON-CHAIN',
    status: 'beta',
    scores: [
      { name: 'MENTO_MONSTER', score: 5000 },
      { name: 'STABLE_PILOT', score: 4200 },
      { name: 'PEGGED_ONE', score: 3800 },
    ],
  },
  'block-breaker': {
    name: 'Block Breaker',
    desc: 'Break Celo blocks before time runs out. Multi-level arcade challenge.',
    time: '60s',
    type: 'ON-CHAIN',
    status: 'soon',
    scores: [
      { name: 'BLOCK_BUSTER', score: 2500 },
      { name: 'PADDLE_PRO', score: 2100 },
      { name: 'BRICK_BOSS', score: 1800 },
    ],
  },
};

// Splash glyph per game — vector SVG from the icons0 Arcticons registry
// (installed via `npx shadcn@latest add @icons0/arcticons/<name>`). Uses
// currentColor so it inherits the muted surface tone; sized large so it
// reads as a chunky arcade insert-coin splash.
const SplashGlyph: React.FC<{ gameId: string }> = ({ gameId }) => {
  const Glyph =
    gameId === 'mento-invaders'
      ? ArcticonsEmojiAlienMonster
      : gameId === 'block-breaker'
        ? ArcticonsBlockBuster
        : gameId === 'stable-sprint'
          ? ArcticonsTrexrunner
          : ArcticonsControlloid; // default — covers gas-gobbler + unknown
  return <Glyph aria-hidden="true" className="image-pixelated text-white/55" style={{ width: '7rem', height: '7rem' }} />;
};

const GameSplash: React.FC<{ gameId: string }> = ({ gameId }) => (
  <div className="flex justify-center items-center" role="presentation">
    <SplashGlyph gameId={gameId} />
  </div>
);

export const Play: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { isConnected, isWrongNetwork, targetChain, switchChain, connect } = useWallet();

  const {
    isPlaying,
    isLoading,
    isClaiming,
    isClaimed,
    claimError,
    txHash,
    lastScore,
    seed,
    startGame,
    onGameOver,
    claimScore,
  } = useGame();

  if (!gameId || !GAME_INFO[gameId]) {
    // This deployment's playable engine is Stable Sprint; route unknown ids there.
    return <Navigate to="/play/stable-sprint" replace />;
  }

  const info = GAME_INFO[gameId];

  const handleClaimClick = () => {
    if (!isConnected) {
      connect();
    } else if (isWrongNetwork) {
      switchChain({ chainId: targetChain.id });
    } else {
      claimScore();
    }
  };

  const handlePlayClick = () => {
    if (!isConnected) {
      connect();
    } else {
      startGame();
    }
  };

  // ── Pre-start / paused / results view (NOT playing) ──
  const PreStartShell: React.FC = () => (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Game header */}
      <header className="text-center">
        <span className="tech-label text-white/45 mb-1.5 block" style={{ fontSize: '13px', letterSpacing: '0.08em' }}>
          CELO&nbsp;ATARI&nbsp;ARCADE
        </span>
        <h1 className="pixel-title mb-3" style={{ fontSize: '35px' }}>{info.name}</h1>
        <Badge status={info.status} />
      </header>

      {/* Splash screen */}
      <Panel className="flex justify-center items-center flex-col">
        <GameSplash gameId={gameId} />
      </Panel>

      {/* How to play */}
      <Panel>
        <h2 className="machine-label machine-label--yellow mb-3" style={{ display: 'inline-block' }}>
          How&nbsp;to&nbsp;play
        </h2>
        <p className="text-white/85 mb-4" style={{ fontSize: '17px', lineHeight: 1.35, textAlign: 'center' }}>
          {info.desc}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="sega-card-stats flex flex-col items-center text-center">
            <span className="tech-label text-white/55" style={{ fontSize: '13px' }}>Mission</span>
            <span className="tech-value text-cream font-bold" style={{ fontSize: '15px' }}>{info.time}</span>
          </div>
          <div className="sega-card-stats flex flex-col items-center text-center">
            <span className="tech-label text-white/55" style={{ fontSize: '13px' }}>Score&nbsp;type</span>
            <span className="tech-value text-success font-bold" style={{ fontSize: '15px' }}>{info.type}</span>
          </div>
        </div>
      </Panel>

      {/* Results / claim / submit states — each a designed panel */}
      {lastScore !== null ? (
        <Panel variant="featured" className="text-center">
          <span className="tech-label text-white/55 mb-1 block" style={{ fontSize: '13px' }}>Last run score</span>
          <div className="font-arcade text-secondary mb-5" style={{ fontSize: '35px', textShadow: '3px 3px 0 var(--color-ink)' }}>
            {lastScore.toLocaleString()}
          </div>

          {!isClaimed ? (
            <>
              <Button
                onClick={handleClaimClick}
                loading={isClaiming}
                fullWidth
                variant={isWrongNetwork && isConnected ? 'destructive' : 'primary'}
              >
                {!isConnected ? 'Connect & save' : isWrongNetwork ? 'Switch network' : 'Save score on-chain'}
              </Button>

              {claimError && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="sega-badge sega-badge--danger" role="alert">
                    <span aria-hidden="true">✕</span>
                    <span>ERROR: {claimError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClaimClick}
                    className="arcade-btn arcade-btn-tertiary"
                    style={{ fontSize: '13px', padding: '4px 10px', minHeight: '0' }}
                  >
                    Try again
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-1">
              <p className="tech-label font-bold text-success mb-1.5" style={{ fontSize: '15px' }}>✓ Score secured on Celo</p>
              {txHash && (
                <a
                  href={`${EXPLORER_URL}${txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="tech-value underline hover:text-success"
                  style={{ fontSize: '13px' }}
                >
                  View transaction on explorer →
                </a>
              )}
            </div>
          )}
        </Panel>
      ) : (
        <Panel>
          <h3 className="tech-label text-white/45 mb-3 text-center" style={{ fontSize: '13px' }}>Current leaders</h3>
          <div className="flex flex-col gap-1">
            {info.scores.map((s, i) => (
              <div key={i} className="sega-score-row" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                <span
                  className="tech-label font-bold"
                  style={{
                    fontSize: '13px',
                    color: i === 0 ? 'var(--color-rank-1)' : i === 1 ? 'var(--color-rank-2)' : i === 2 ? 'var(--color-rank-3)' : 'var(--color-cream)',
                  }}
                >
                  ★
                </span>
                <span className="tech-value text-white/70" style={{ fontSize: '15px' }}>{i + 1}. {s.name}</span>
                <span className="tech-value text-success font-bold" style={{ fontSize: '15px' }}>{s.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Wallet warning state */}
      {!isConnected && (
        <Panel variant="locked" role="alert" className="flex items-start gap-3">
          <span aria-hidden="true" className="text-warning font-bold" style={{ fontFamily: 'var(--font-mono)', fontSize: '17px' }}>!</span>
          <div>
            <p className="tech-label font-bold text-warning mb-1" style={{ fontSize: '13px' }}>Wallet not connected</p>
            <p className="text-white/65" style={{ fontSize: '15px', lineHeight: 1.3 }}>Connect your wallet before playing to save scores on the Celo blockchain.</p>
          </div>
        </Panel>
      )}

      {/* Primary action */}
      <Button onClick={handlePlayClick} disabled={isLoading || isClaiming} loading={isLoading} fullWidth>
        {!isConnected ? 'Connect wallet to play' : lastScore !== null ? 'Play again' : 'Start game'}
      </Button>

      <Link to="/" className={buttonClass('tertiary', 'self-center')} style={{ fontSize: '13px' }}>
        ◂ Back to menu
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col items-center py-6 px-4 w-full max-w-md mx-auto min-h-[calc(100vh-80px)] justify-center">
      {isPlaying ? <GameContainer onGameOver={onGameOver} seed={seed} /> : <PreStartShell />}
    </div>
  );
};
