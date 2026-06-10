import { Player } from '@celo-arcade/game-engine';
import { Score } from '@celo-arcade/game-engine';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width = 448;
  private height = 496;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx.imageSmoothingEnabled = false;
  }

  public draw(player: Player, scoreObj: Score, isGameOver: boolean) {
    // 1. Draw sky gradient
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 400);
    skyGrad.addColorStop(0, '#120b1a');
    skyGrad.addColorStop(1, '#241432');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, 400);

    // Draw scrolling grid lines on the wall for depth
    this.ctx.strokeStyle = 'rgba(124, 192, 255, 0.04)';
    this.ctx.lineWidth = 1;
    const gridSpacing = 40;
    const scrollOffset = (Date.now() / 8) % gridSpacing;
    for (let x = -scrollOffset; x < this.width; x += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 400);
      this.ctx.stroke();
    }

    // 2. Draw ground (y > 400)
    const groundGrad = this.ctx.createLinearGradient(0, 400, 0, this.height);
    groundGrad.addColorStop(0, '#102511'); // deep forest
    groundGrad.addColorStop(1, '#081009');
    this.ctx.fillStyle = groundGrad;
    this.ctx.fillRect(0, 400, this.width, this.height - 400);

    // Draw scrolling perspective lines on the ground
    this.ctx.strokeStyle = '#476520';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 400);
    this.ctx.lineTo(this.width, 400);
    this.ctx.stroke();

    const roadScroll = (Date.now() / 5) % 30;
    for (let x = -roadScroll; x < this.width; x += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 400);
      this.ctx.lineTo(x - 20, this.height);
      this.ctx.stroke();
    }

    // 3. Draw USDm Coins
    for (const coin of scoreObj.coins) {
      if (coin.collected) continue;
      
      const cx = coin.x;
      const cy = coin.y + coin.height / 2;
      
      // Outer glow
      this.ctx.fillStyle = 'rgba(86, 223, 124, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 10 + Math.sin(Date.now() / 100) * 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Coin body
      this.ctx.fillStyle = '#56DF7C'; // USDm Green
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Currency sign $ inside coin
      this.ctx.fillStyle = '#120b1a';
      this.ctx.font = 'bold 8px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('$', cx, cy + 3);
    }

    // 4. Draw Obstacles (Red Candlesticks)
    for (const obs of scoreObj.obstacles) {
      const ox = obs.x - obs.width / 2;
      const oy = obs.y;
      
      this.ctx.fillStyle = '#F72585'; // Volatile red
      this.ctx.fillRect(ox, oy, obs.width, obs.height);
      
      // Draw wick lines for financial candlestick aesthetic
      this.ctx.strokeStyle = '#F72585';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      if (obs.type === 'low') {
        this.ctx.moveTo(obs.x, oy);
        this.ctx.lineTo(obs.x, oy - 8);
      } else {
        this.ctx.moveTo(obs.x, oy + obs.height);
        this.ctx.lineTo(obs.x, oy + obs.height + 8);
      }
      this.ctx.stroke();
    }

    // 5. Draw Runner (Player)
    const px = player.x - player.width / 2;
    const py = player.y - player.height;
    
    // Player body
    this.ctx.fillStyle = '#FCFF52'; // Prosperity Yellow
    this.ctx.fillRect(px, py, player.width, player.height);

    // Legs animation (running effect)
    this.ctx.fillStyle = '#8a8c1a';
    if (!player.isJumping && !player.isSliding) {
      const legPhase = Math.floor(Date.now() / 60) % 2;
      if (legPhase === 0) {
        this.ctx.fillRect(px + 3, player.y, 4, 3);
        this.ctx.fillRect(px + player.width - 7, player.y - 3, 4, 3);
      } else {
        this.ctx.fillRect(px + 3, player.y - 3, 4, 3);
        this.ctx.fillRect(px + player.width - 7, player.y, 4, 3);
      }
    } else if (player.isJumping) {
      // Jumping tucked legs
      this.ctx.fillRect(px + 4, player.y - 3, 4, 3);
      this.ctx.fillRect(px + player.width - 8, player.y - 3, 4, 3);
    } else if (player.isSliding) {
      // Sliding layout
      this.ctx.fillRect(px - 4, player.y - 4, 4, 4);
    }

    // Draw eye/visor facing right
    this.ctx.fillStyle = '#120b1a';
    if (player.isSliding) {
      this.ctx.fillRect(player.x + 4, py + 4, 4, 3);
    } else {
      this.ctx.fillRect(player.x + 4, py + 6, 4, 3);
    }

    // 6. Draw HUD & stats overlay
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`SPEED ${scoreObj.scrollSpeed.toFixed(1)}px/f`, this.width - 15, this.height - 15);

    // 7. Draw UI overlay if Game Over
    if (isGameOver) {
      this.ctx.fillStyle = 'rgba(10, 6, 20, 0.85)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = '#FCF6F1';
      this.ctx.font = 'bold 24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('LIQUIDATED', this.width / 2, this.height / 2 - 30);
      
      this.ctx.fillStyle = '#FCFF52';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.fillText(`DISTANCE: ${scoreObj.current}`, this.width / 2, this.height / 2 + 10);
      
      this.ctx.fillStyle = '#655947';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('PRESS START TO RETRY', this.width / 2, this.height / 2 + 50);
    }
  }
}
