// client/src/components/Editor/CodeEditor.jsx
import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

const CodeEditor = ({ 
  value, 
  onChange, 
  language, 
  theme,
  readOnly = false,
  height = '100%'
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add custom keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Trigger save event
      const event = new CustomEvent('editor-save', { detail: { code: editor.getValue() } });
      window.dispatchEvent(event);
    });

    // Add custom command for run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const event = new CustomEvent('editor-run');
      window.dispatchEvent(event);
    });

    // Focus editor
    editor.focus();
  };

  const handleEditorChange = (value) => {
    if (onChange && !readOnly) {
      onChange(value || '');
    }
  };

  // Get language-specific default code
  const getDefaultCode = (lang) => {
    const defaults = {
      javascript: '// JavaScript\nconsole.log("Hello, World!");\n',
      python: '# Python\nprint("Hello, World!")\n',
      java: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
      cpp: '// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
      c: '// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
      typescript: '// TypeScript\nconst message: string = "Hello, World!";\nconsole.log(message);\n',
      html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n',
      css: '/* CSS */\nbody {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n}\n'
    };
    return defaults[lang] || '// Start coding...\n';
  };

  return (
    <div className="code-editor-wrapper">
      <Editor
        height={height}
        language={language}
        value={value || getDefaultCode(language)}
        theme={theme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          tabSize: 2,
          readOnly: readOnly,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          selectOnLineNumbers: true,
          roundedSelection: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: true,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          },
          folding: true,
          glyphMargin: true,
          contextmenu: true,
          mouseWheelZoom: true
        }}
        loading={
          <div className="editor-loading">
            <div className="spinner"></div>
            <p>Loading editor...</p>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;