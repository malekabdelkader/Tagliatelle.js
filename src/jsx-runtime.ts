/**
 * 🍝 JSX Runtime for <Tag>liatelle.js
 *
 * This provides the modern JSX transform runtime (React 17+ style).
 * TypeScript/esbuild/tsx will automatically import from here when using:
 * { "jsx": "react-jsx", "jsxImportSource": "tagliatelle" }
 */

import type { TagliatelleElement, TagliatelleNode } from './types.js';

/**
 * Fragment component - groups children without a wrapper
 */
export const Fragment = Symbol.for('tagliatelle.fragment');

/**
 * JSX runtime function for production
 * Called for elements with a single child or no children
 */
export function jsx(
  type: string | Function | symbol,
  props: Record<string, unknown> & { children?: TagliatelleNode },
  _key?: string
): TagliatelleElement {
  const { children, ...restProps } = props || {};

  // Normalize children to array
  const childArray =
    children !== undefined ? (Array.isArray(children) ? children : [children]) : [];

  return {
    type: type as string | Function,
    props: restProps,
    children: childArray.flat().filter((c) => c != null && c !== false && c !== true),
  };
}

/**
 * JSX runtime function for elements with multiple static children
 * Same as jsx but called when there are multiple children
 */
export function jsxs(
  type: string | Function | symbol,
  props: Record<string, unknown> & { children?: TagliatelleNode[] },
  _key?: string
): TagliatelleElement {
  const { children, ...restProps } = props || {};

  // Children is already an array for jsxs
  const childArray = children || [];

  return {
    type: type as string | Function,
    props: restProps,
    children: childArray.flat().filter((c) => c != null && c !== false && c !== true),
  };
}

/**
 * JSX dev runtime function (same as jsx for our purposes)
 */
export const jsxDEV = jsx;
