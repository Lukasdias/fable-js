import Konva from 'konva';
import { pulseAnimation } from './animations/pulse';
import { bounceAnimation } from './animations/bounce';
import { spinAnimation } from './animations/spin';
import { shakeAnimation } from './animations/shake';
import { fadeInAnimation } from './animations/fade-in';
import { fadeOutAnimation } from './animations/fade-out';

// Animation registry
const ANIMATION_REGISTRY: Record<string, any> = {
  pulse: pulseAnimation,
  bounce: bounceAnimation,
  spin: spinAnimation,
  shake: shakeAnimation,
  fade_in: fadeInAnimation,
  fade_out: fadeOutAnimation,
};

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
  | 'back-ease-in-out'
  | 'elastic-ease-in'
  | 'elastic-ease-out'
  | 'elastic-ease-in-out'
  | 'bounce-ease-in'
  | 'bounce-ease-out'
  | 'bounce-ease-in-out'
  | 'strong-ease-in'
  | 'strong-ease-out'
  | 'strong-ease-in-out';

/**
 * Maps easing string names from DSL to Konva easing functions.
 * Using 'any' for the function type since Konva's elastic easings have different signatures.
 */
const EASING_MAP: Record<EasingType | string, (t: number, b: number, c: number, d: number, ...args: any[]) => number> = {
  // Existing mappings
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

  // Additional easings from docs
  'back-ease-in-out': Konva.Easings.BackEaseInOut,
  'elastic-ease-in-out': Konva.Easings.ElasticEaseInOut,
  'bounce-ease-in': Konva.Easings.BounceEaseIn,
  'bounce-ease-in-out': Konva.Easings.BounceEaseInOut,
  'strong-ease-in-out': Konva.Easings.StrongEaseInOut,
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
 * Stores original node values for restoration after animation ends.
 */
export interface OriginalValues {
  scaleX: number;
  scaleY: number;
  opacity: number;
  rotation: number;
  x: number;
  y: number;
}

/**
 * Frame object passed to Konva.Animation callback.
 * Konva doesn't export this type, so we define it here.
 */
export interface AnimationFrame {
  /** Total elapsed time since animation start in milliseconds */
  time: number;
  /** Time since last frame in milliseconds */
  timeDiff: number;
  /** Current frame rate in frames per second */
  frameRate: number;
}

/**
 * Manages Konva animations and tweens for Fable agents.
 * Provides methods for:
 * - Moving agents with tweening (move action)
 * - Starting/stopping predefined animations (animate option)
 */

export class AnimationEngine {
  /** Map of agent ID to their active Konva.Animation instances */
  private animations: Map<string, Konva.Animation> = new Map();

  /** Map of agent ID to their active Konva.Tween instances */
  private tweens: Map<string, Konva.Tween> = new Map();

  /** Map of agent ID to original values for restoration on stop */
  private originalValues: Map<string, OriginalValues> = new Map();

  /** Callback to get agent ref by ID */
  private getAgentRef: (id: string) => Konva.Node | null;

  constructor(getAgentRef: (id: string) => Konva.Node | null) {
    this.getAgentRef = getAgentRef;
  }

  /**
   * Move an agent to a new position with tweening.
   * DSL: `move #score to [400, 100] duration 500ms easing "ease-out"`
   */
  moveAgent(agentId: string, options: MoveOptions): boolean {
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
   * Tween any properties of an agent.
   */
  tweenAgent(agentId: string, options: { properties: Record<string, any>; duration: number; easing?: EasingType | string }): boolean {
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
      duration: options.duration / 1000, // Konva uses seconds
      easing,
      ...options.properties, // Spread the properties to tween
    });

    this.tweens.set(agentId, tween);
    tween.play();
    return true;
  }

  /**
   * Stop an active tween for an agent.
   */
  stopTween(agentId: string): void {
    const tween = this.tweens.get(agentId);
    if (tween) {
      tween.destroy();
      this.tweens.delete(agentId);
    }
  }

  /**
   * Restore original values for a node after animation stops.
   */
  private restoreOriginalValues(agentId: string): void {
    const node = this.getAgentRef(agentId);
    const original = this.originalValues.get(agentId);
    
    if (node && original) {
      node.scaleX(original.scaleX);
      node.scaleY(original.scaleY);
      node.opacity(original.opacity);
      node.rotation(original.rotation);
      node.x(original.x);
      node.y(original.y);
    }
    
    this.originalValues.delete(agentId);
  }

  /**
   * Start a predefined animation on an agent.
   * DSL: `text #title "Bounce!" at [100, 100] animate "bounce" duration 1s repeat 3`
   */
  startAnimation(agentId: string, options: AnimationOptions): boolean {
    const node = this.getAgentRef(agentId);
    if (!node) {
      console.warn(`AnimationEngine: Agent ${agentId} not found`);
      return false;
    }

    // Stop any existing animation for this agent
    this.stopAnimation(agentId);

    const layer = node.getLayer();
    if (!layer) {
      console.warn(`AnimationEngine: Agent ${agentId} has no layer`);
      return false;
    }

    const animationFunction = ANIMATION_REGISTRY[options.type] as any;
    if (!animationFunction) {
      console.warn(`AnimationEngine: Unknown animation type "${options.type}"`);
      return false;
    }

    // Store original values for restoration
    const originalValues: OriginalValues = {
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      opacity: node.opacity(),
      rotation: node.rotation(),
      x: node.x(),
      y: node.y(),
    };
    this.originalValues.set(agentId, originalValues);

    const animation = animationFunction(node, layer, options, originalValues);
    this.animations.set(agentId, animation);
    animation.start();
    return true;
  }

  /**
   * Stop an active animation for an agent and restore original state.
   * DSL: `stop_animation #score`
   */
  stopAnimation(agentId: string): void {
    const animation = this.animations.get(agentId);
    if (animation) {
      animation.stop();
      this.animations.delete(agentId);
      this.restoreOriginalValues(agentId);
    }
  }

  /**
   * Stop all animations and tweens. Call on cleanup.
   */
  stopAll(): void {
    // Stop all animations and restore original values
    this.animations.forEach((anim, agentId) => {
      anim.stop();
      this.restoreOriginalValues(agentId);
    });
    this.animations.clear();
    this.originalValues.clear();
    
    this.tweens.forEach((tween) => tween.destroy());
    this.tweens.clear();
  }



  /**
   * Check if an agent has an active tween.
   */
  hasTween(agentId: string): boolean {
    return this.tweens.has(agentId);
  }
}
