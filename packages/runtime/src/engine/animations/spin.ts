import Konva from 'konva';
import type { AnimationOptions, OriginalValues } from '../animation-engine';

export const spinAnimation = (
  node: Konva.Node,
  layer: Konva.Layer,
  options: AnimationOptions,
  originalValues: OriginalValues
): Konva.Animation => {
  const duration = options.duration || 1000;
  const repeat = options.repeat ?? -1;

  let animationStartTime: number | null = null;
  let lastCycle = -1;

  return new Konva.Animation((frame) => {
    if (!frame) return;

    if (repeat >= 0) {
      if (animationStartTime === null) {
        animationStartTime = frame.time;
      }

      const elapsed = frame.time - animationStartTime;
      const currentCycle = Math.floor(elapsed / duration);

      if (currentCycle > lastCycle) {
        lastCycle = currentCycle;
      }

      if (currentCycle >= repeat) {
        return;
      }
    }

    const progress = (frame.time % duration) / duration;
    node.rotation(originalValues.rotation + progress * 360);
  }, layer);
};