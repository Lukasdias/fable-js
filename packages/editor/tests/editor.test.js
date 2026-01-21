import { describe, it, expect } from 'vitest';
import { validateDSL } from '@fable-js/parser';

// Note: Monaco editor tests are skipped as they require browser environment
describe('Fable Editor', () => {
  it('should validate DSL correctly', () => {
    const validDSL = `fable "Test" do
  page 1 do
    text "Hello" at [0, 0]
  end
end`;

    const invalidDSL = `fable "Test" do
  invalid syntax here
end`;

    expect(validateDSL(validDSL).valid).toBe(true);
    expect(validateDSL(invalidDSL).valid).toBe(false);
  });

  it.skip('should register FableJS language', () => {
    // This test requires Monaco editor which only works in browser environment
    // Tested manually in the web application
  });
});