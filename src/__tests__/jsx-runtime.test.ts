import { describe, it, expect } from 'vitest';
import { jsx, jsxs, jsxDEV, Fragment } from '../jsx-runtime.js';

describe('Fragment', () => {
  it('should be a unique symbol', () => {
    expect(typeof Fragment).toBe('symbol');
    expect(Fragment).toBe(Symbol.for('tagliatelle.fragment'));
  });
});

describe('jsx', () => {
  it('should create an element with type and props', () => {
    const element = jsx('div', { className: 'container' });
    expect(element.type).toBe('div');
    expect(element.props).toEqual({ className: 'container' });
    expect(element.children).toEqual([]);
  });

  it('should handle a single child', () => {
    const element = jsx('div', { children: 'Hello' });
    expect(element.children).toEqual(['Hello']);
  });

  it('should handle single child as array', () => {
    const element = jsx('div', { children: ['Hello'] });
    expect(element.children).toEqual(['Hello']);
  });

  it('should exclude children from props', () => {
    const element = jsx('div', { children: 'Hello', className: 'test' });
    expect(element.props).toEqual({ className: 'test' });
    expect(element.props).not.toHaveProperty('children');
  });

  it('should handle null props', () => {
    // @ts-expect-error - testing null props
    const element = jsx('div', null);
    expect(element.type).toBe('div');
    expect(element.props).toEqual({});
    expect(element.children).toEqual([]);
  });

  it('should filter out null, undefined, true, and false from children', () => {
    const element = jsx('div', { children: [null, 'text', undefined, false, true, 0] });
    expect(element.children).toEqual(['text', 0]);
  });

  it('should flatten nested children arrays', () => {
    const element = jsx('div', { children: [['a', 'b'], 'c'] });
    expect(element.children).toEqual(['a', 'b', 'c']);
  });

  it('should handle function components', () => {
    const MyComponent = () => jsx('div', {});
    const element = jsx(MyComponent, { someProp: 'value' });
    expect(element.type).toBe(MyComponent);
    expect(element.props).toEqual({ someProp: 'value' });
  });

  it('should handle Fragment symbol', () => {
    const element = jsx(Fragment, { children: ['a', 'b'] });
    expect(element.type).toBe(Fragment);
    expect(element.children).toEqual(['a', 'b']);
  });

  it('should handle number children', () => {
    const element = jsx('span', { children: 42 });
    expect(element.children).toEqual([42]);
  });

  it('should handle nested elements as children', () => {
    const child = jsx('span', { children: 'nested' });
    const parent = jsx('div', { children: child });
    expect(parent.children).toEqual([child]);
  });

  it('should ignore the key parameter', () => {
    const element = jsx('div', { className: 'test' }, 'unique-key');
    expect(element.type).toBe('div');
    expect(element.props).toEqual({ className: 'test' });
  });
});

describe('jsxs', () => {
  it('should create an element with multiple children', () => {
    const element = jsxs('div', { children: ['Hello', 'World'] });
    expect(element.type).toBe('div');
    expect(element.children).toEqual(['Hello', 'World']);
  });

  it('should handle empty children array', () => {
    const element = jsxs('div', { children: [] });
    expect(element.children).toEqual([]);
  });

  it('should handle undefined children', () => {
    const element = jsxs('div', { className: 'test' });
    expect(element.children).toEqual([]);
  });

  it('should exclude children from props', () => {
    const element = jsxs('ul', {
      children: ['item1', 'item2'],
      className: 'list',
    });
    expect(element.props).toEqual({ className: 'list' });
  });

  it('should filter out null, undefined, true, and false from children', () => {
    const element = jsxs('div', {
      children: [null, 'a', undefined, 'b', false, 'c', true],
    });
    expect(element.children).toEqual(['a', 'b', 'c']);
  });

  it('should flatten nested children arrays', () => {
    const element = jsxs('div', {
      children: [
        ['a', 'b'],
        ['c', 'd'],
      ],
    });
    expect(element.children).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should handle null props', () => {
    // @ts-expect-error - testing null props
    const element = jsxs('div', null);
    expect(element.type).toBe('div');
    expect(element.props).toEqual({});
    expect(element.children).toEqual([]);
  });

  it('should handle nested elements', () => {
    const child1 = jsx('span', { children: 'first' });
    const child2 = jsx('span', { children: 'second' });
    const parent = jsxs('div', { children: [child1, child2] });
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
  });

  it('should handle mixed children types', () => {
    const childElement = jsx('span', {});
    const element = jsxs('div', {
      children: ['text', 42, childElement],
    });
    expect(element.children).toEqual(['text', 42, childElement]);
  });
});

describe('jsxDEV', () => {
  it('should be the same as jsx', () => {
    expect(jsxDEV).toBe(jsx);
  });

  it('should work the same as jsx', () => {
    const element = jsxDEV('div', { className: 'test', children: 'Hello' });
    expect(element.type).toBe('div');
    expect(element.props).toEqual({ className: 'test' });
    expect(element.children).toEqual(['Hello']);
  });
});

describe('integration', () => {
  it('should support nested component trees', () => {
    const Header = () => jsx('header', { children: 'Header' });
    const Content = () =>
      jsxs('main', {
        children: [jsx('h1', { children: 'Title' }), jsx('p', { children: 'Paragraph' })],
      });

    const App = () =>
      jsxs(Fragment, {
        children: [jsx(Header, {}), jsx(Content, {})],
      });

    const app = App();
    expect(app.type).toBe(Fragment);
    expect(app.children).toHaveLength(2);
  });

  it('should preserve zero as a valid child', () => {
    const element = jsxs('span', { children: [0, 1, 2] });
    expect(element.children).toEqual([0, 1, 2]);
  });

  it('should handle deeply nested structures', () => {
    const level3 = jsx('span', { children: 'deep' });
    const level2 = jsx('div', { children: level3 });
    const level1 = jsx('section', { children: level2 });

    expect(level1.type).toBe('section');
    expect(level1.children[0]).toBe(level2);
    expect((level1.children[0] as typeof level2).children[0]).toBe(level3);
  });
});
