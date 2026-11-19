import React, { useState } from 'react';
import { FileCode, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';

interface SkillMarkdownEditorProps {
  onMarkdownChange: (md: string) => void;
}

export const SkillMarkdownEditor: React.FC<SkillMarkdownEditorProps> = ({ onMarkdownChange }) => {
  const { activeSkillMarkdown, activeSkillName } = useInkFlowStore();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = activeSkillMarkdown.split('\n');
  const lineCount = Math.max(lines.length, 12);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSkillMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filename = `${activeSkillName || 'Atmospheric Fiction Partner'}.md`;

  return (
    <div className={`bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl flex flex-col shadow-xs overflow-hidden transition-all ${
      isExpanded ? 'fixed inset-6 z-50 bg-[#FAF7F2]' : 'flex-1'
    }`}>
      {/* Tab Header */}
      <div className="h-10 px-4 bg-[#F2EDE3] border-b border-[#E3DDD1] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#C77B5B]" />
          <span className="font-mono text-xs font-semibold text-[#25251F]">
            {filename}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Copy Markdown"
            className="p-1.5 rounded-lg text-[#78736A] hover:text-[#25251F] hover:bg-[#E5DFD3] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3E5535]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand Editor"}
            className="p-1.5 rounded-lg text-[#78736A] hover:text-[#25251F] hover:bg-[#E5DFD3] transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Surface with Line Numbers */}
      <div className="flex-1 flex overflow-hidden min-h-[380px]">
        {/* Line Numbers Column */}
        <div className="w-10 py-4 select-none text-right pr-3 font-mono text-xs text-[#A8A196] border-r border-[#EBE4D8] bg-[#FAF7F2]/50">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Surface */}
        <div className="flex-1 relative overflow-y-auto">
          <textarea
            value={activeSkillMarkdown}
            onChange={(e) => onMarkdownChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-4 font-mono text-xs leading-6 bg-transparent text-[#25251F] focus:outline-none resize-none selection:bg-[#A7B69A]/30 selection:text-[#181814]"
            placeholder="# Writing Partner Name&#10;&#10;## Voice&#10;Describe tone, pacing, restraint...&#10;&#10;## Style&#10;Describe stylistic preferences...&#10;&#10;## When helping&#10;Describe rules for suggestions..."
          />
        </div>
      </div>
    </div>
  );
};
