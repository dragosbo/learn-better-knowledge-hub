import React, { useMemo } from 'react';

interface PythonSyntaxHighlighterProps {
  code: string;
  wrapLines?: boolean;
  onLineClick?: (lineNumber: number) => void;
  highlightedLine?: number | null;
}

// Token types for syntax highlighting
interface Token {
  type: 'keyword' | 'builtin' | 'string' | 'comment' | 'function' | 'class' | 'decorator' | 'number' | 'operator' | 'text';
  text: string;
}

const KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not',
  'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
  'True', 'False', 'None'
]);

const BUILTINS = new Set([
  'print', 'len', 'range', 'open', 'str', 'int', 'float', 'list', 'dict',
  'set', 'tuple', 'bool', 'super', 'enumerate', 'zip', 'min', 'max',
  'sum', 'isinstance', 'issubclass', 'map', 'filter', 'any', 'all',
  'getattr', 'setattr', 'hasattr', 'dir', 'id', 'type', 'repr', 'abs',
  'round', 'sorted', 'reversed', 'format', 'input', 'Exception', 'ValueError',
  'TypeError', 'KeyError', 'IndexError', 'FileNotFoundError', 'IOError', 'RuntimeError'
]);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = line.length;

  while (i < n) {
    // Comment
    if (line[i] === '#') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // String literals (single or double quotes)
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      // Check for triple quotes
      if (line.slice(i, i + 3) === quote.repeat(3)) {
        const triple = quote.repeat(3);
        const end = line.indexOf(triple, i + 3);
        if (end !== -1) {
          tokens.push({ type: 'string', text: line.slice(i, end + 3) });
          i = end + 3;
        } else {
          tokens.push({ type: 'string', text: line.slice(i) });
          break;
        }
      } else {
        let end = i + 1;
        while (end < n && line[end] !== quote) {
          if (line[end] === '\\') end += 2;
          else end++;
        }
        if (end < n) end++; // include closing quote
        tokens.push({ type: 'string', text: line.slice(i, end) });
        i = end;
      }
      continue;
    }

    // Decorator
    if (line[i] === '@' && (i === 0 || /\s/.test(line[i - 1]))) {
      let end = i + 1;
      while (end < n && /[a-zA-Z0-9_\.]/.test(line[end])) end++;
      tokens.push({ type: 'decorator', text: line.slice(i, end) });
      i = end;
      continue;
    }

    // Words / Identifiers
    if (/[a-zA-Z_]/.test(line[i])) {
      let end = i + 1;
      while (end < n && /[a-zA-Z0-9_]/.test(line[end])) end++;
      const word = line.slice(i, end);

      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (BUILTINS.has(word)) {
        tokens.push({ type: 'builtin', text: word });
      } else {
        // Check if previous non-whitespace token was 'def' or 'class'
        const prevNonSpace = tokens.filter(t => t.text.trim().length > 0).pop();
        if (prevNonSpace && prevNonSpace.text === 'def') {
          tokens.push({ type: 'function', text: word });
        } else if (prevNonSpace && prevNonSpace.text === 'class') {
          tokens.push({ type: 'class', text: word });
        } else {
          // Lookahead for function call
          let nextCharIdx = end;
          while (nextCharIdx < n && line[nextCharIdx] === ' ') nextCharIdx++;
          if (nextCharIdx < n && line[nextCharIdx] === '(') {
            tokens.push({ type: 'function', text: word });
          } else {
            tokens.push({ type: 'text', text: word });
          }
        }
      }
      i = end;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(line[i])) {
      let end = i + 1;
      while (end < n && /[0-9\.xXbBoOa-fA-F_]/.test(line[end])) end++;
      tokens.push({ type: 'number', text: line.slice(i, end) });
      i = end;
      continue;
    }

    // Symbols & whitespace
    let end = i + 1;
    while (end < n && !/[a-zA-Z0-9_#"']/.test(line[end])) end++;
    tokens.push({ type: 'text', text: line.slice(i, end) });
    i = end;
  }

  return tokens;
}

export const PythonSyntaxHighlighter: React.FC<PythonSyntaxHighlighterProps> = ({
  code,
  wrapLines = true,
  onLineClick,
  highlightedLine,
}) => {
  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <div className="font-mono text-[12.5px] leading-relaxed select-text overflow-auto">
      <div className="min-w-full inline-block">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlightedLine === lineNum;
          const tokens = tokenizeLine(line);

          return (
            <div
              key={lineNum}
              onClick={() => onLineClick?.(lineNum)}
              className={`flex transition-colors cursor-pointer group ${
                isHighlighted
                  ? 'bg-amber-500/15 border-l-2 border-amber-400'
                  : 'hover:bg-slate-800/40 border-l-2 border-transparent'
              }`}
            >
              {/* Line Number */}
              <span
                className="w-12 shrink-0 text-right pr-3 select-none text-slate-500 text-xs py-0.5 border-r border-slate-800/60 group-hover:text-slate-300 transition-colors"
              >
                {lineNum}
              </span>

              {/* Code Tokens */}
              <span
                className={`pl-3.5 py-0.5 ${
                  wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto'
                } flex-1`}
              >
                {tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  tokens.map((tok, tIdx) => {
                    let className = 'text-slate-200';
                    switch (tok.type) {
                      case 'keyword':
                        className = 'text-sky-400 font-semibold token-keyword';
                        break;
                      case 'builtin':
                        className = 'text-cyan-300 token-builtin';
                        break;
                      case 'string':
                        className = 'text-emerald-300 token-string';
                        break;
                      case 'comment':
                        className = 'text-slate-400 italic token-comment';
                        break;
                      case 'function':
                        className = 'text-amber-300 font-medium token-function';
                        break;
                      case 'class':
                        className = 'text-teal-300 font-bold token-class';
                        break;
                      case 'decorator':
                        className = 'text-purple-400 token-decorator';
                        break;
                      case 'number':
                        className = 'text-orange-300 token-number';
                        break;
                      default:
                        className = 'text-slate-200';
                    }
                    return (
                      <span key={tIdx} className={className}>
                        {tok.text}
                      </span>
                    );
                  })
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
