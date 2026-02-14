import { describe, it, expect } from 'vitest';
import { jsx, jsxs, jsxDEV, Fragment } from '../jsx-runtime.js';

describe('Fragment', () => {
  it('should be a unique symbol', () => {
    expect(typeof Fragment).toBe('symbol');
    expect(Fragment.toString()).toBe('Symbol(tagliatelle.fragment)');
  });
});

describe('jsx', () => {
  it('should create an element with type and props', () => {
    const element = jsx('div', { id: 'test', className: 'container' });

    expect(element.type).toBe('div');
    expect(element.props).toEqual({ id: 'test', className: 'container' });
    expect(element.children).toEqual([]);
  });

  it('should handle single child', () => {
    const element = jsx('div', { children: 'Hello' });

    expect(element.children).toEqual(['Hello']);
    expect(element.props).toEqual({});
  });

  it('should handle array of children passed as single child', () => {
    const element = jsx('ul', { children: ['Item 1', 'Item 2'] });

    expect(element.children).toEqual(['Item 1', 'Item 2']);
  });

  it('should filter out null, undefined, and boolean children', () => {
    const element = jsx('div', { children: [null, 'valid', undefined, false, true, 'also valid'] });

    expect(element.children).toEqual(['valid', 'also valid']);
  });

  it('should handle function components', () => {
    const MyComponent = () => ({ type: 'div', props: {}, children: [] });
    const element = jsx(MyComponent, { prop: 'value' });

    expect(element.type).toBe(MyComponent);
    expect(element.props).toEqual({ prop: 'value' });
  });

  it('should handle Fragment symbol', () => {
    const element = jsx(Fragment, { children: ['child1', 'child2'] });

    expect(element.type).toBe(Fragment);
    expect(element.children).toEqual(['child1', 'child2']);
  });

  it('should handle undefined props', () => {
    const element = jsx('div', undefined as unknown as Record<string, unknown>);

    expect(element.type).toBe('div');
    expect(element.props).toEqual({});
    expect(element.children).toEqual([]);
  });

  it('should flatten nested arrays in children', () => {
    const element = jsx('div', { children: [['a', 'b'], 'c'] });

    expect(element.children).toEqual(['a', 'b', 'c']);
  });

  it('should ignore key parameter', () => {
    const element = jsx('div', { id: 'test' }, 'my-key');

    expect(element.type).toBe('div');
    expect(element.props).toEqual({ id: 'test' });
    expect((element as { key?: string }).key).toBeUndefined();
  });
});

describe('jsxs', () => {
  it('should create an element with multiple children', () => {
    const element = jsxs('ul', {
      children: ['Item 1', 'Item 2', 'Item 3']
    });

    expect(element.type).toBe('ul');
    expect(element.children).toEqual(['Item 1', 'Item 2', 'Item 3']);
  });

  it('should handle empty children array', () => {
    const element = jsxs('div', { children: [] });

    expect(element.children).toEqual([]);
  });

  it('should filter falsy values from children', () => {
    const element = jsxs('div', {
      children: ['first', null, 'second', false, undefined, 'third', true]
    });

    expect(element.children).toEqual(['first', 'second', 'third']);
  });

  it('should flatten nested arrays', () => {
    const element = jsxs('div', {
      children: [['nested1', 'nested2'], 'flat']
    });

    expect(element.children).toEqual(['nested1', 'nested2', 'flat']);
  });

  it('should separate children from other props', () => {
    const element = jsxs('button', {
      type: 'submit',
      disabled: false,
      children: ['Click me']
    });

    expect(element.props).toEqual({ type: 'submit', disabled: false });
    expect(element.children).toEqual(['Click me']);
  });

  it('should handle undefined children', () => {
    const element = jsxs('div', { id: 'test' });

    expect(element.children).toEqual([]);
  });
});

describe('jsxDEV', () => {
  it('should be the same function as jsx', () => {
    expect(jsxDEV).toBe(jsx);
  });

  it('should work identically to jsx', () => {
    const jsxElement = jsx('span', { children: 'text' });
    const jsxDEVElement = jsxDEV('span', { children: 'text' });

    expect(jsxElement).toEqual(jsxDEVElement);
  });
});

describe('integration scenarios', () => {
  it('should handle nested elements', () => {
    const inner = jsx('span', { children: 'Hello' });
    const outer = jsx('div', { className: 'wrapper', children: inner });

    expect(outer.type).toBe('div');
    expect(outer.props).toEqual({ className: 'wrapper' });
    expect(outer.children).toHaveLength(1);
    expect(outer.children[0]).toEqual({
      type: 'span',
      props: {},
      children: ['Hello']
    });
  });

  it('should handle component with multiple nested children', () => {
    const header = jsx('h1', { children: 'Title' });
    const paragraph = jsx('p', { children: 'Content' });
    const container = jsxs('article', {
      id: 'main',
      children: [header, paragraph]
    });

    expect(container.type).toBe('article');
    expect(container.props).toEqual({ id: 'main' });
    expect(container.children).toHaveLength(2);
    expect((container.children[0] as { type: string }).type).toBe('h1');
    expect((container.children[1] as { type: string }).type).toBe('p');
  });

  it('should handle Fragment with multiple children', () => {
    const element = jsxs(Fragment, {
      children: [
        jsx('div', { children: 'First' }),
        jsx('div', { children: 'Second' })
      ]
    });

    expect(element.type).toBe(Fragment);
    expect(element.children).toHaveLength(2);
  });

  it('should handle numeric children', () => {
    const element = jsx('span', { children: 42 });

    expect(element.children).toEqual([42]);
  });

  it('should handle mixed content children', () => {
    const childComponent = jsx('strong', { children: 'bold' });
    const element = jsxs('p', {
      children: ['Hello ', childComponent, ' world!']
    });

    expect(element.children).toHaveLength(3);
    expect(element.children[0]).toBe('Hello ');
    expect(element.children[1]).toEqual({
      type: 'strong',
      props: {},
      children: ['bold']
    });
    expect(element.children[2]).toBe(' world!');
  });
});
