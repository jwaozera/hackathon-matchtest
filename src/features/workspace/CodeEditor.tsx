import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ code, onChange, language = 'typescript', readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;

    // Define custom dark theme matching our design system
    monaco.editor.defineTheme('syncsolve-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'variable', foreground: 'ffa657' },
        { token: 'constant', foreground: '79c0ff' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b2299',
        'editor.selectionBackground': '#264f7844',
        'editorCursor.foreground': '#58a6ff',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#8b949e',
        'editor.inactiveSelectionBackground': '#264f7822',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
        'editorWhitespace.foreground': '#21262d',
        'scrollbarSlider.background': '#484f5833',
        'scrollbarSlider.hoverBackground': '#484f5866',
        'scrollbarSlider.activeBackground': '#484f5899',
      },
    });

    monaco.editor.setTheme('syncsolve-dark');

    // Focus the editor
    editor.focus();
  }, []);

  const handleChange = useCallback((value: string | undefined) => {
    onChange(value || '');
  }, [onChange]);

  return (
    <div className="code-editor">
      <div className="code-editor__header">
        <div className="code-editor__tabs">
          <div className="code-editor__tab code-editor__tab--active">
            <span className="code-editor__tab-icon">📄</span>
            <span className="code-editor__tab-name">paymentService.ts</span>
            <span className="code-editor__tab-dot" />
          </div>
        </div>
        <div className="code-editor__actions">
          <span className="code-editor__lang-badge">{language.toUpperCase()}</span>
        </div>
      </div>
      <div className="code-editor__body">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            wordWrap: 'on',
            readOnly,
            automaticLayout: true,
            tabSize: 2,
          }}
          loading={
            <div className="code-editor__loading">
              <div className="code-editor__loading-spinner" />
              <span>Carregando editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
