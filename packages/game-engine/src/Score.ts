import { Player } from './Player';

export class SimplePRNG {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  public next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export interface Obstacle {
  x: number;
  y: number; // top y
  width: number;
  height: number;
  type: 'low' | 'high';
}

export interface Coin {
  x: number;
  y: number; // top y
  width: number;
  height: number;
  collected: boolean;
}

export class Score {
  public current: number = 0;
  public level: number = 1;
  public obstacles: Obstacle[] = [];
  public coins: Coin[] = [];
  public scrollSpeed = 5.0;
  
  private prng: SimplePRNG;
  private ticksSinceLastSpawn = 0;
  private nextSpawnTick = 80;

  constructor(seed: number) {
    this.prng = new SimplePRNG(seed);
  }

  public update(player: Player): boolean {
    // 1. Survived frames add score
    this.current++;
    
    // Level is derived from score
    this.level = 1 + Math.floor(this.current / 1200);
    
    // Speed increases slowly
    this.scrollSpeed = 5.0 + (this.level - 1) * 0.8 + (this.current % 1200) * 0.0008;

    // 2. Move obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.scrollSpeed;
      
      // Check collision
      if (this.checkAABBOverlap(player, obs)) {
        return true; // Collision = Game Over
      }
      
      // Remove off-screen
      if (obs.x < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // 3. Move coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.x -= this.scrollSpeed;

      // Check coin collection
      if (!coin.collected && this.checkAABBOverlap(player, coin)) {
        coin.collected = true;
        this.current += 50; // Coin collection reward
      }

      // Remove off-screen
      if (coin.x < -40) {
        this.coins.splice(i, 1);
      }
    }

    // 4. Procedural spawn logic
    this.ticksSinceLastSpawn++;
    if (this.ticksSinceLastSpawn >= this.nextSpawnTick) {
      this.ticksSinceLastSpawn = 0;
      // Spawn spacing gets tighter as level increases
      const minInterval = Math.max(50, 90 - this.level * 5);
      const randInterval = Math.max(30, 80 - this.level * 4);
      this.nextSpawnTick = Math.floor(minInterval + this.prng.next() * randInterval);

      // 50% chance for low vs high obstacle
      const obstacleType = this.prng.next() < 0.5 ? 'low' : 'high';
      if (obstacleType === 'low') {
        // Must jump over this
        this.obstacles.push({
          x: 480,
          y: 378, // Ground is 400, height is 22 -> range [378, 400]
          width: 18,
          height: 22,
          type: 'low'
        });
      } else {
        // Must slide under this
        this.obstacles.push({
          x: 480,
          y: 338, // Ground is 400, height is 25 -> range [338, 363]
          width: 20,
          height: 25,
          type: 'high'
        });
      }

      // Spawn a coin shortly after or before the obstacle
      const coinY = this.prng.next() < 0.5 ? 320 : 368;
      this.coins.push({
        x: 480 + 80 + Math.floor(this.prng.next() * 60),
        y: coinY,
        width: 14,
        height: 14,
        collected: false
      });
    }

    return false;
  }

  private checkAABBOverlap(player: Player, rect: { x: number; y: number; width: number; height: number }): boolean {
    const pLeft = player.x - player.width / 2;
    const pRight = player.x + player.width / 2;
    const pTop = player.y - player.height;
    const pBottom = player.y;

    const rLeft = rect.x - rect.width / 2;
    const rRight = rect.x + rect.width / 2;
    const rTop = rect.y;
    const rBottom = rect.y + rect.height;

    const xOverlap = pLeft < rRight && pRight > rLeft;
    const yOverlap = pTop < rBottom && pBottom > rTop;

    return xOverlap && yOverlap;
  }
}
