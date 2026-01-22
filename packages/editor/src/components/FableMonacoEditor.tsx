import { validateDSL } from '@fable-js/parser';
import * as monaco from 'monaco-editor';
import React, { useCallback, useEffect, useRef } from 'react';
import { registerFableLanguage } from '../lib/fable-language.js';

export interface FableMonacoEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  width?: string | number;
  height?: string | number;
  theme?: string;
  options?: monaco.editor.IEditorOptions;
}

export const FableMonacoEditor: React.FC<FableMonacoEditorProps> = ({
  value,
  onChange,
  onMount,
  width = '100%',
  height = '100%',
  theme = 'fable-dark',
  options = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscriptionRef = useRef<monaco.IDisposable | null>(null);

  // Register language and theme on mount
  useEffect(() => {
    registerFableLanguage();

    // Set the theme
    monaco.editor.setTheme(theme);

    return () => {
      // Cleanup
      if (subscriptionRef.current) {
        subscriptionRef.current.dispose();
      }
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [theme]);

  // Stable debounced linting function
  const debouncedLint = useCallback((value: string, model: monaco.editor.ITextModel) => {
    // Clear any existing timeout
    const timeoutId = setTimeout(() => {
      const validation = validateDSL(value);
      if (validation.valid) {
        monaco.editor.setModelMarkers(model, 'fable-parser', []);
      } else {
        const marker: monaco.editor.IMarkerData = {
          severity: monaco.MarkerSeverity.Error,
          message: validation.error || 'Parse error',
          source: 'fable-parser',
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        };
        monaco.editor.setModelMarkers(model, 'fable-parser', [marker]);
      }
    }, 300);

    // Store timeout ID for cleanup
    (debouncedLint as any).timeoutId = timeoutId;
  }, []);

  // Create editor instance - only when container is ready
  useEffect(() => {
    if (!containerRef.current) return;

    const defaultOptions: monaco.editor.IEditorOptions = {
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      wordWrapColumn: 80,
      rulers: [80],
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      formatOnType: true,
      formatOnPaste: true,
      ...options
    };

    editorRef.current = monaco.editor.create(containerRef.current, defaultOptions);

    // Set the language on the model
    const model = editorRef.current.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, 'fable');
    }

    // Set the theme
    monaco.editor.setTheme(theme);

    // Setup change listener with debounced operations
    subscriptionRef.current = editorRef.current.onDidChangeModelContent(() => {
      const newValue = editorRef.current?.getValue() || '';

      // Always call onChange - parent will handle deduplication if needed
      onChange?.(newValue);

      // Debounced linting
      const model = editorRef.current?.getModel();
      if (model) {
        debouncedLint(newValue, model);
      }
    });

    // Add keyboard shortcuts
    editorRef.current.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editorRef.current?.getAction('editor.action.formatDocument')?.run();
    });

    // Call onMount callback
    onMount?.(editorRef.current);

    return () => {
      // Clear any pending timeouts
      if ((debouncedLint as any).timeoutId) {
        clearTimeout((debouncedLint as any).timeoutId);
      }

      if (subscriptionRef.current) {
        subscriptionRef.current.dispose();
      }
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [value, theme]); // Removed onChange, onMount, options from deps to prevent re-creation

  // Update value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Handle onMount callback changes
  useEffect(() => {
    if (editorRef.current && onMount) {
      onMount(editorRef.current);
    }
  }, [onMount]);

  return <div ref={containerRef} style={{ width, height }} />;
};