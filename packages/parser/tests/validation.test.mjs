import { describe, it, expect } from 'vitest';
import { parseDSL, validateDSL } from '../src/index.js';

describe('Error Handling', () => {
  it('should throw an error for invalid DSL syntax', () => {
    const invalidDsl = `
      fable "Broken" do
        invalid syntax here
      end
    `;

    expect(() => parseDSL(invalidDsl)).toThrow();
  });

  it('should throw error for missing closing end', () => {
    const invalidDsl = `
      fable "Unclosed" do
        page 1 do
          text "Hello" at [100, 100]
    `;

    expect(() => parseDSL(invalidDsl)).toThrow();
  });

  it('should throw error for invalid position format', () => {
    const invalidDsl = `
      fable "BadPosition" do
        page 1 do
          text "Hello" at 100, 100
        end
      end
    `;

    expect(() => parseDSL(invalidDsl)).toThrow();
  });

  it('should throw error for missing quotes on string', () => {
    const invalidDsl = `
      fable Test do
        page 1 do
          text "Hello" at [100, 100]
        end
      end
    `;

    expect(() => parseDSL(invalidDsl)).toThrow();
  });

  it('should throw error for invalid agent type', () => {
    const invalidDsl = `
      fable "Test" do
        page 1 do
          widget "Hello" at [100, 100]
        end
      end
    `;

    expect(() => parseDSL(invalidDsl)).toThrow();
  });
});

describe('Validation', () => {
  it('should validate correct DSL', () => {
    const dsl = `
      fable "Valid" do
        page 1 do
          text "Hello" at [100, 100]
        end
      end
    `;

    const result = validateDSL(dsl);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return error message for invalid DSL', () => {
    const invalidDsl = `
      fable "Invalid" do
        broken stuff
      end
    `;

    const result = validateDSL(invalidDsl);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe('string');
  });

  it('should validate DSL with all agent types', () => {
    const dsl = `
      fable "Complete" do
        page 1 do
          text #txt "Hello" at [100, 100]
          button #btn "Click" at [200, 200] do end
          image #img "pic.png" at [300, 300]
          video #vid "video.mp4" at [400, 400]
        end
      end
    `;

    const result = validateDSL(dsl);

    expect(result.valid).toBe(true);
  });

  it('should validate DSL with named agent IDs', () => {
    const dsl = `
      fable "Named Agents" do
        page 1 do
          text #my-text "Hello" at [100, 100]
          button #my-button "Click" at [200, 200] do
            on_click do
              move #my-text to [300, 300] duration 1s
            end
          end
        end
      end
    `;

    const result = validateDSL(dsl);

    expect(result.valid).toBe(true);
  });
});
