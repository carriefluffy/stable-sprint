import { Player } from './Player';
import { Score } from './Score';
import { FrameInput } from './ReplayRecorder';

export class HeadlessSimulator {
  public static simulate(seed: number, inputs: FrameInput[], maxFrames: number = 36000) {
    let currentFrame = 0;
    let inputIndex = 0;
    
    const player = new Player();
    const scoreObj = new Score(seed);
    
    let isOver = false;
    let terminatedEarly = false;

    while (!isOver && currentFrame < maxFrames) {
      currentFrame++;

      // Apply inputs for this frame (recorded after frame currentFrame - 1 finished)
      while (inputIndex < inputs.length && inputs[inputIndex].f === currentFrame - 1) {
        player.setDirection(inputs[inputIndex].d);
        inputIndex++;
      }

      // Update player (jump/gravity/slide timers)
      player.update();

      // Scroll obstacles, check collisions, check procedural spawns
      isOver = scoreObj.update(player);
    }

    if (!isOver && currentFrame >= maxFrames) {
      terminatedEarly = true;
    }

    return {
      finalScore: scoreObj.current,
      frameCount: currentFrame,
      terminated: terminatedEarly
    };
  }
}
