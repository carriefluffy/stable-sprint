export const Direction = {
  NONE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export class Player {
  public x = 80;
  public y = 400; // Ground level (bottom alignment)
  public vy = 0;
  public width = 24;
  public height = 36;
  
  public isJumping = false;
  public isSliding = false;
  public slideTimer = 0;
  
  private gravity = 0.6;
  
  constructor() {
    this.x = 80;
    this.y = 400;
  }

  public setDirection(dir: Direction) {
    if (dir === Direction.UP) {
      this.jump();
    } else if (dir === Direction.DOWN) {
      this.slide();
    }
  }

  public jump() {
    if (!this.isJumping && !this.isSliding) {
      this.vy = -12.5;
      this.isJumping = true;
    }
  }

  public slide() {
    if (!this.isJumping && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 32;
      this.height = 18;
    }
  }

  public update() {
    // Apply jump gravity
    if (this.isJumping) {
      this.y += this.vy;
      this.vy += this.gravity;
      
      // Hit ground
      if (this.y >= 400) {
        this.y = 400;
        this.vy = 0;
        this.isJumping = false;
      }
    }

    // Apply slide timer
    if (this.isSliding) {
      this.slideTimer--;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.height = 36;
      }
    }
  }
}
