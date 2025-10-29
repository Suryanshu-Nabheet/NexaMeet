import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { WebglAddon } from '@xterm/addon-webgl';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import '@xterm/xterm/css/xterm.css';

interface CodeEditorProps {
  meetingId: string;
  isHost: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ meetingId, isHost }) => {
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const editorRef = useRef<any>(null);
  const ydoc = useRef<Y.Doc>(new Y.Doc());
  const provider = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    // Initialize terminal
    if (terminalRef.current && !terminalInstance.current) {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
          cursor: '#ffffff',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#ffffff'
        }
      });

      // Add terminal addons
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const searchAddon = new SearchAddon();
      const webglAddon = new WebglAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.loadAddon(searchAddon);
      term.loadAddon(webglAddon);

      term.open(terminalRef.current);
      fitAddon.fit();

      // Handle terminal resize
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(terminalRef.current);

      terminalInstance.current = term;

      // Initialize terminal with welcome message
      term.writeln('Welcome to NexaMeet Terminal');
      term.writeln('Type "help" for available commands');
      term.write('\r\n$ ');

      // Handle terminal input
      term.onData((data: string) => {
        // Handle terminal input here
        // You can implement command execution logic
        term.write(data);
      });
    }

    // Initialize collaboration
    provider.current = new WebsocketProvider(
      'wss://your-signaling-server.com',
      `nexameet-${meetingId}`,
      ydoc.current
    );

    return () => {
      terminalInstance.current?.dispose();
      provider.current?.destroy();
    };
  }, [meetingId]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Set up collaboration
    const ytext = ydoc.current.getText('monaco');
    const binding = new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.current?.awareness
    );

    // Add custom commands
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        return {
          suggestions: [
            {
              label: 'console.log',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'console.log($1)',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range
            }
          ]
        };
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-gray-800">
        <div className="flex space-x-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded"
            aria-label="Select programming language"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded"
            aria-label="Select editor theme"
          >
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>
        {isHost && (
          <button
            onClick={() => {
              const code = editorRef.current?.getValue();
              if (code && terminalInstance.current) {
                terminalInstance.current.writeln(`\r\n$ Executing code...`);
                // Add your code execution logic here
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
            aria-label="Run code"
          >
            Run Code
          </button>
        )}
      </div>
      
      <div className="flex-1 flex">
        <div className="w-2/3 h-full">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            theme={theme}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              tabSize: 2,
              insertSpaces: true,
              autoIndent: 'full'
            }}
          />
        </div>
        <div className="w-1/3 h-full bg-black p-2">
          <div ref={terminalRef} className="h-full" />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 