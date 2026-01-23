import Konva from 'konva';
import type { AnimationOptions, OriginalValues } from '../animation-engine';

export const fadeInAnimation = (
  node: Konva.Node,
  layer: Konva.Layer,
  options: AnimationOptions,
  originalValues: OriginalValues
): Konva.Animation => {
  const duration = options.duration || 1000;

  node.opacity(0);
  return new Konva.Animation((frame) => {
    if (!frame) return;

    const progress = Math.min(frame.time / duration, 1);
    node.opacity(progress * originalValues.opacity);

    if (progress >= 1) {
      // Animation complete
    }
  }, layer);
};