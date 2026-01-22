import Konva from 'konva';

/**
 * Predefined animation types supported by the DSL.
 * Usage in DSL: `text "Hello" at [100, 100] animate "bounce" duration 1s repeat 3`
 */
export type AnimationType = 'bounce' | 'pulse' | 'fade_in' | 'fade_out' | 'spin' | 'shake';

/**
 * Easing function types matching Konva's built-in easings.
 * Usage in DSL: `move agent 1 to [400, 100] duration 500ms easing "ease-out"`
 */
export type EasingType = 
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'back-ease-in'
  | 'back-ease-out'
  | 'elastic-ease-in'
  | 'elastic-ease-out'
  | 'bounce-ease-out'
  | 'strong-ease-in'
  | 'strong-ease-out';

/**
 * Maps easing string names from DSL to Konva easing functions.
 * Using 'any' for the function type since Konva's elastic easings have different signatures.
 */
const EASING_MAP: Record<EasingType | string, (t: number, b: number, c: number, d: number, ...args: any[]) => number> = {
  'linear': Konva.Easings.Linear,
  'ease-in': Konva.Easings.EaseIn,
  'ease-out': Konva.Easings.EaseOut,
  'ease-in-out': Konva.Easings.EaseInOut,
  'back-ease-in': Konva.Easings.BackEaseIn,
  'back-ease-out': Konva.Easings.BackEaseOut,
  'elastic-ease-in': Konva.Easings.ElasticEaseIn,
  'elastic-ease-out': Konva.Easings.ElasticEaseOut,
  'bounce-ease-out': Konva.Easings.BounceEaseOut,
  'strong-ease-in': Konva.Easings.StrongEaseIn,
  'strong-ease-out': Konva.Easings.StrongEaseOut,
};

/**
 * Options for move tween action.
 */
export interface MoveOptions {
  x: number;
  y: number;
  /** Duration in milliseconds */
  duration: number;
  easing?: EasingType | string;
  onComplete?: () => void;
}

/**
 * Options for starting an animation.
 */
export interface AnimationOptions {
  type: AnimationType;
  /** Duration of one animation cycle in milliseconds */
  duration?: number;
  /** Number of times to repeat (-1 for infinite) */
  repeat?: number;
}

/**
 * Manages Konva animations and tweens for Fable agents.
 * Provides methods for:
 * - Moving agents with tweening (move action)
 * - Starting/stopping predefined animations (animate option)
 */
export class AnimationEngine {
  /** Map of agent ID to their active Konva.Animation instances */
  private animations: Map<number, Konva.Animation> = new Map();
  
  /** Map of agent ID to their active Konva.Tween instances */
  private tweens: Map<number, Konva.Tween> = new Map();
  
  /** Callback to get agent ref by ID */
  private getAgentRef: (id: number) => Konva.Node | null;

  constructor(getAgentRef: (id: number) => Konva.Node | null) {
    this.getAgentRef = getAgentRef;
  }

  /**
   * Move an agent to a new position with tweening.
   * DSL: `move agent 1 to [400, 100] duration 500ms easing "ease-out"`
   */
  moveAgent(agentId: number, options: MoveOptions): boolean {
    const node = this.getAgentRef(agentId);
    if (!node) {
      console.warn(`AnimationEngine: Agent ${agentId} not found`);
      return false;
    }

    // Stop any existing tween for this agent
    this.stopTween(agentId);

    const easing = options.easing 
      ? (EASING_MAP[options.easing] || Konva.Easings.EaseOut)
      : Konva.Easings.EaseOut;

    const tween = new Konva.Tween({
      node,
      x: options.x,
      y: options.y,
      duration: options.duration / 1000, // Konva uses seconds
      easing,
      onFinish: () => {
        this.tweens.delete(agentId);
        options.onComplete?.();
      },
    });

    this.tweens.set(agentId, tween);
    tween.play();
    return true;
  }

  /**
   * Stop an active tween for an agent.
   */
  stopTween(agentId: number): void {
    const tween = this.tweens.get(agentId);
    if (tween) {
      tween.destroy();
      this.tweens.delete(agentId);
    }
  }

  /**
   * Start a predefined animation on an agent.
   * DSL: `text "Bounce!" at [100, 100] animate "bounce" duration 1s repeat 3`
   */
  startAnimation(agentId: number, options: AnimationOptions): boolean {
    const node = this.getAgentRef(agentId);
    if (!node) {
      console.warn(`AnimationEngine: Agent ${agentId} not found`);
      return false;
    }

    // Stop any existing animation for this agent
    this.stopAnimation(agentId);

    const duration = options.duration || 1000;
    const repeat = options.repeat ?? -1; // -1 = infinite by default
    let cycleCount = 0;

    const layer = node.getLayer();
    if (!layer) {
      console.warn(`AnimationEngine: Agent ${agentId} has no layer`);
      return false;
    }

    // Store original values for restoration
    const originalScale = { x: node.scaleX(), y: node.scaleY() };
    const originalOpacity = node.opacity();
    const originalRotation = node.rotation();
    const originalPos = { x: node.x(), y: node.y() };

    let animation: Konva.Animation;

    switch (options.type) {
      case 'bounce':
        animation = new Konva.Animation((frame) => {
          if (!frame) return;
          const progress = (frame.time % duration) / duration;
          // Bounce uses sin for smooth up/down motion
          const bounce = Math.abs(Math.sin(progress * Math.PI));
          node.y(originalPos.y - bounce * 20);
        }, layer);
        break;

      case 'pulse':
        animation = new Konva.Animation((frame) => {
          if (!frame) return;
          const progress = (frame.time % duration) / duration;
          const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
          node.scaleX(originalScale.x * scale);
          node.scaleY(originalScale.y * scale);
        }, layer);
        break;

      case 'fade_in':
        node.opacity(0);
        animation = new Konva.Animation((frame) => {
          if (!frame) return;
          const progress = Math.min(frame.time / duration, 1);
          node.opacity(progress);
          if (progress >= 1) {
            animation.stop();
            this.animations.delete(agentId);
          }
        }, layer);
        break;

      case 'fade_out':
        animation = new Konva.Animation((frame) => {
          if (!frame) return;
          const progress = Math.min(frame.time / duration, 1);
          node.opacity(originalOpacity * (1 - progress));
          if (progress >= 1) {
            animation.stop();
            this.animations.delete(agentId);
          }
        }, layer);
        break;

      case 'spin':
        animation = new Konva.Animation((frame) => {
          if (!frame) return;
          const progress = (frame.time % duration) / duration;
          node.rotation(originalRotation + progress * 360);
        }, layer);
        break;

      case 'shake':
        animation = new Konva.Animation((frame) => {
          if (!frame) return;
          const progress = (frame.time % duration) / duration;
          // Shake effect using sin with decreasing amplitude
          const shake = Math.sin(progress * Math.PI * 8) * 5 * (1 - progress);
          node.x(originalPos.x + shake);
        }, layer);
        break;

      default:
        console.warn(`AnimationEngine: Unknown animation type "${options.type}"`);
        return false;
    }

    // Handle repeat count
    if (repeat > 0) {
      const originalStart = animation.start.bind(animation);
      const wrappedAnimation = animation;
      let startTime = 0;
      
      wrappedAnimation.start = () => {
        const result = originalStart();
        // Check cycles in the animation frame callback
        const checkCycles = new Konva.Animation((frame) => {
          if (!frame) return;
          const elapsed = frame.time - startTime;
          const currentCycle = Math.floor(elapsed / duration);
          if (currentCycle >= repeat) {
            wrappedAnimation.stop();
            checkCycles.stop();
            this.animations.delete(agentId);
            // Restore original values
            node.scaleX(originalScale.x);
            node.scaleY(originalScale.y);
            node.opacity(originalOpacity);
            node.rotation(originalRotation);
            node.x(originalPos.x);
            node.y(originalPos.y);
          }
        }, layer);
        checkCycles.start();
        return result;
      };
    }

    this.animations.set(agentId, animation);
    animation.start();
    return true;
  }

  /**
   * Stop an active animation for an agent and restore original state.
   * DSL: `stop_animation agent 1`
   */
  stopAnimation(agentId: number): void {
    const animation = this.animations.get(agentId);
    if (animation) {
      animation.stop();
      this.animations.delete(agentId);
    }
  }

  /**
   * Stop all animations and tweens. Call on cleanup.
   */
  stopAll(): void {
    this.animations.forEach((anim) => anim.stop());
    this.animations.clear();
    
    this.tweens.forEach((tween) => tween.destroy());
    this.tweens.clear();
  }

  /**
   * Check if an agent has an active animation.
   */
  hasAnimation(agentId: number): boolean {
    return this.animations.has(agentId);
  }

  /**
   * Check if an agent has an active tween.
   */
  hasTween(agentId: number): boolean {
    return this.tweens.has(agentId);
  }
}
