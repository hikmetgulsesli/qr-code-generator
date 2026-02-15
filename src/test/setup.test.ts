import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have vitest configured', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const value: string = 'test';
    expect(typeof value).toBe('string');
  });

  it('should support React JSX', () => {
    // JSX is supported if this file compiles
    expect(true).toBe(true);
  });
});
