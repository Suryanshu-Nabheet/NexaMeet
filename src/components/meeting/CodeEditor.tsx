import React, { useState } from 'react';
import { X, Code as CodeIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface CodeEditorProps {
  initialCode: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  readOnly: boolean;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  language,
  onCodeChange,
  onLanguageChange,
  readOnly,
  onClose,
}) => {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange(newCode);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    onLanguageChange(newLanguage);
  };

  return (
    <div className="h-full flex flex-col bg-dark-400">
      <div className="p-4 border-b border-dark-300 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <CodeIcon className="mr-2" size={20} />
            Code Editor
          </h3>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            disabled={readOnly}
            className="bg-dark-300 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Select programming language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close code editor"
        >
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 p-4">
        <textarea
          value={code}
          onChange={handleCodeChange}
          readOnly={readOnly}
          className="w-full h-full bg-dark-300 text-white font-mono p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          style={{ tabSize: 2 }}
          aria-label="Code editor"
          placeholder="Start coding here..."
        />
      </div>

      {readOnly && (
        <div className="p-4 border-t border-dark-300 bg-dark-300/50">
          <p className="text-sm text-gray-400">
            You are in read-only mode. Only the host can edit the code.
          </p>
        </div>
      )}
    </div>
  );
};