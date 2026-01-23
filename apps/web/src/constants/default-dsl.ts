import { parseDSL } from '@fable-js/parser';
import { MAIN_DSL } from './main.fable';
import { PAGE1_DSL } from './pages/page1.fable';
import { PAGE2_DSL } from './pages/page2.fable';
import { PAGE3_DSL } from './pages/page3.fable';

/**
 * Build the full AST by parsing and merging required files
 */
export function buildFullAST() {
  const fileMap: Record<string, string> = {
    'pages/page1.fable': PAGE1_DSL,
    'pages/page2.fable': PAGE2_DSL,
    'pages/page3.fable': PAGE3_DSL,
  };

  // Parse main file
  const mainAst = parseDSL(MAIN_DSL);

  // Merge required files
  const allPages = [...mainAst.pages];
  const allStatements = [...mainAst.statements];

  mainAst.requires.forEach((path: string) => {
    const content = fileMap[path];
    if (content) {
      // Wrap content in fable structure for parsing
      const wrappedContent = `fable "temp" do\n${content}\nend`;
      try {
        const ast = parseDSL(wrappedContent);
        allPages.push(...ast.pages);
        allStatements.push(...ast.statements);
      } catch (error) {
        console.warn(`Failed to parse ${path}:`, error);
      }
    } else {
      console.warn(`Required file not found: ${path}`);
    }
  });

  return {
    ...mainAst,
    pages: allPages,
    statements: allStatements,
  };
}

export const DEFAULT_AST = buildFullAST();

// Also export the merged DSL string for the editor
export const DEFAULT_DSL = `
fable "Interactive Animation Demo" do
  init score to 0
  init health to 100
  init bouncing to true

  ${PAGE1_DSL}
  ${PAGE2_DSL}
  ${PAGE3_DSL}
end`;
