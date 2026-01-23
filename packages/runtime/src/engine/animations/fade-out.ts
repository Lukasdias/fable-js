import Konva from 'konva';
import type { AnimationOptions, OriginalValues } from '../animation-engine';

export const fadeOutAnimation = (
  node: Konva.Node,
  layer: Konva.Layer,
  options: AnimationOptions,
  originalValues: OriginalValues
): Konva.Animation => {
  const duration = options.duration || 1000;

  return new Konva.Animation((frame) => {
    if (!frame) return;

    const progress = Math.min(frame.time / duration, 1);
    node.opacity(originalValues.opacity * (1 - progress));

    if (progress >= 1) {
      // Animation complete
    }
  }, layer);
};