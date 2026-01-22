import { useMemo } from 'react'
import type { InterpolatedString } from '@fable-js/parser'
import { ExpressionEvaluator } from '../engine/ExpressionEvaluator.js'

/**
 * Hook to evaluate interpolated strings with current variables.
 * Handles both plain strings and interpolated string objects.
 */
export function useInterpolatedText(
  content: string | InterpolatedString | undefined,
  variables: Map<string, unknown>,
  fallback = ''
): string {
  const evaluator = useMemo(
    () =>
      new ExpressionEvaluator({
        getVariable: (name: string) => variables.get(name) ?? 0,
        hasVariable: (name: string) => variables.has(name),
      }),
    [variables]
  )

  return useMemo(() => {
    if (!content) return fallback

    if (typeof content === 'object' && 'type' in content) {
      const interpolated = content as InterpolatedString
      if (interpolated.type === 'interpolated_string') {
        return String(evaluator.evaluate(interpolated))
      }
    }

    return String(content)
  }, [content, evaluator, fallback])
}
