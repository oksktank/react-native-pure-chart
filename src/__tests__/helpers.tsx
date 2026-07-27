// Shared test utilities for the components project. Not matched by
// `*.test.*`, excluded from the npm tarball by `!**/__tests__` and from
// `tsc` by the tsconfig exclude.
import { fireEvent } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';
import {
  resolvePadding,
  resolveTheme,
  resolveXAxis,
  resolveYAxis,
} from '../internal/resolve';
import type { XAxisOptions, YAxisOptions } from '../types';

/** Fires the onLayout every measuring container gates its children on. */
export function layout(
  instance: TestInstance,
  width: number,
  height: number
): Promise<undefined> {
  return fireEvent(instance, 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

/** Presses at plot-local coordinates, as the chart press handlers read them. */
export function pressAt(
  instance: TestInstance,
  x: number,
  y: number
): Promise<void> {
  return fireEvent.press(instance, {
    nativeEvent: { locationX: x, locationY: y },
  });
}

/** One node of `render().toJSON()`. */
export interface JsonNode {
  type: string;
  props: Record<string, unknown>;
  children: (JsonNode | string)[] | null;
}

type JsonTree = JsonNode | (JsonNode | string)[] | string | null;

/** Merges a (possibly nested) style array into one plain object. */
export function flatStyle(node: JsonNode): Record<string, unknown> {
  const flatten = (style: unknown): Record<string, unknown> => {
    if (Array.isArray(style)) {
      return style.reduce<Record<string, unknown>>(
        (acc, part) => ({ ...acc, ...flatten(part) }),
        {}
      );
    }
    return style && typeof style === 'object'
      ? (style as Record<string, unknown>)
      : {};
  };
  return flatten(node.props?.style);
}

/** All nodes in the JSON tree matching the predicate, depth-first. */
export function findNodes(
  tree: JsonTree,
  predicate: (node: JsonNode) => boolean
): JsonNode[] {
  const found: JsonNode[] = [];
  const visit = (node: JsonTree) => {
    if (node === null || typeof node === 'string') {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (predicate(node)) {
      found.push(node);
    }
    node.children?.forEach(visit);
  };
  visit(tree);
  return found;
}

export function countNodes(
  tree: JsonTree,
  predicate: (node: JsonNode) => boolean
): number {
  return findNodes(tree, predicate).length;
}

/** Resolved-prop fixtures for driving ChartContainer/HorizontalFrame directly. */
export const themeOf = resolveTheme;
export const yAxisOf = (overrides?: YAxisOptions) => resolveYAxis(overrides);
export const xAxisOf = (overrides?: XAxisOptions) => resolveXAxis(overrides);
export const paddingOf = resolvePadding;
