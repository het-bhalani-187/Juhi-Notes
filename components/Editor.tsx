import React, { useState, useEffect, useRef } from 'react';
import { Note, User } from '../types';
import { Button } from './UI';
import { analyzeText, expandText } from '../services/geminiService';

interface EditorProps {
  note: Note;
  currentUser: User;
  onUpdate: (updatedNote: Note) => void;
  readOnly: boolean;
}

export const Editor: React.FC<EditorProps> = ({ note, currentUser, onUpdate, readOnly }) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
  }, [note.id]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate({ ...note, content: newContent, updatedAt: Date.now() });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate({ ...note, title: newTitle, updatedAt: Date.now() });
  };

  const handleAiAction = async (action: 'fix' | 'expand' | 'summarize') => {
    if (readOnly) return;
    setIsAiProcessing(true);
    try {
      let result = "";
      if (action === 'fix') {
        result = await analyzeText(content, "Fix grammar and spelling errors. Return only the corrected text.");
      } else if (action === 'expand') {
        result = await expandText(content);
      } else if (action === 'summarize') {
        const summary = await analyzeText(content, "Summarize this note in 2-3 bullet points.");
        result = content + "\n\n### AI Summary\n" + summary;
      }

      if (result) {
        setContent(result);
        onUpdate({ ...note, content: result, updatedAt: Date.now() });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-8 py-8 animate-in fade-in duration-300">
      
      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled Note"
        disabled={readOnly}
        className="text-4xl font-serif font-bold text-slate-800 placeholder:text-slate-300 bg-transparent border-none focus:outline-none focus:ring-0 w-full mb-6"
      />

      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mr-2">Gemini AI</span>
          <Button 
            variant="ghost" 
            onClick={() => handleAiAction('fix')}
            disabled={isAiProcessing}
            className="text-xs"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>}
          >
            Fix Grammar
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => handleAiAction('expand')}
            disabled={isAiProcessing}
            className="text-xs"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>}
          >
            Expand
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => handleAiAction('summarize')}
            disabled={isAiProcessing}
            className="text-xs"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>}
          >
            Summarize
          </Button>
          
          {isAiProcessing && (
            <span className="ml-auto text-xs text-indigo-500 animate-pulse flex items-center gap-1">
               <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Thinking...
            </span>
          )}
        </div>
      )}

      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        disabled={readOnly}
        placeholder="Start writing..."
        className="w-full flex-1 resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 font-normal"
        spellCheck={false}
      />
    </div>
  );
};
