import React, { useState } from 'react';
import { 
  Check, 
  Maximize2, 
  Minimize2, 
  MoreHorizontal, 
  ChevronDown, 
  BookOpen,
  Copy,
  Download,
  FileText
} from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { buildDynamicModelOptions } from '../../lib/modelRouter';
import { OllamaIcon } from '../icons/OllamaIcon';
import { db } from '../../storage/DexieStorage';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../ui/dropdown-menu';

export const TopBar: React.FC = () => {
  const { 
    currentScreen, 
    activeProjectTitle, 
    activeChapterTitle, 
    activeSceneId, 
    saveStatus, 
    editorStats,
    isFocusMode,
    toggleFocusMode,
    selectedModel,
    setSelectedModel,
    availableModels,
    setModelRoutingMode
  } = useInkFlowStore();

  const [copiedNotification, setCopiedNotification] = useState(false);
  const modelOptions = buildDynamicModelOptions(availableModels);

  const handleCopyManuscript = async () => {
    try {
      const scene = await db.scenes.get(activeSceneId);
      const text = scene?.contentHtml ? scene.contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      await navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text:', err);
    }
  };

  const handleExportFile = async (type: 'md' | 'txt') => {
    try {
      const scene = await db.scenes.get(activeSceneId);
      const rawText = scene?.contentHtml ? scene.contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      const title = activeChapterTitle || 'manuscript';
      const content = type === 'md' 
        ? `# ${activeProjectTitle}\n\n## ${activeChapterTitle}\n\n${rawText}` 
        : `${activeProjectTitle}\n${activeChapterTitle}\n\n${rawText}`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${type}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Failed to export file:', err);
    }
  };

  return (
    <header className="h-13 border-b border-[#E3DDD3] bg-[#F7F3EB]/90 backdrop-blur-md px-6 flex items-center justify-between select-none z-20">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        {currentScreen === 'editor' ? (
          <div className="flex items-center gap-2 text-xs text-[#524F47]">
            <BookOpen className="w-3.5 h-3.5 text-[#7C776E]" />
            <span className="font-medium text-[#25251F]">{activeProjectTitle}</span>
            <span className="text-[#A59F95]">›</span>
            <span className="text-[#59554C] truncate max-w-xs">{activeChapterTitle}</span>
          </div>
        ) : (
          <div className="text-xs font-serif italic text-[#7C776E]">
            {currentScreen === 'studio' ? 'Writing Studio' : currentScreen === 'projects' ? 'Projects Overview' : currentScreen === 'templates' ? 'Templates Library' : 'Skills & Agent Studio'}
          </div>
        )}
      </div>

      {/* Right Area: Word Count, Focus Mode, Clean Ollama Selector */}
      <div className="flex items-center gap-3">
        {currentScreen === 'editor' && (
          <>
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 text-xs text-[#5F6E55] bg-[#EBF0E6] px-2.5 py-1 rounded-full border-[#D5E0CD]">
              <Check className="w-3 h-3 text-[#3E5535]" />
              <span className="font-medium">
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
            </Badge>

            <div className="text-xs text-[#5A564E] font-medium px-1">
              {editorStats.words.toLocaleString()} words
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFocusMode}
              title={isFocusMode ? "Exit Focus Mode" : "Distraction-Free Mode"}
              className="h-8 w-8 text-[#6B665D] hover:text-[#25251F] hover:bg-[#EAE4D7] rounded-lg cursor-pointer"
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Manuscript Options"
                  className="h-8 w-8 text-[#6B665D] hover:text-[#25251F] hover:bg-[#EAE4D7] rounded-lg cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#FAF7F2] border-[#DDD5C7] rounded-xl shadow-lg p-1.5 z-50 text-xs font-sans"
              >
                <DropdownMenuItem
                  onClick={handleCopyManuscript}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#7A7469]" />
                  <span>{copiedNotification ? 'Copied to clipboard!' : 'Copy Manuscript Text'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExportFile('md')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#7A7469]" />
                  <span>Export as Markdown (.md)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExportFile('txt')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#7A7469]" />
                  <span>Export as Text (.txt)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#EFEAE0] my-1" />
                <DropdownMenuItem
                  onClick={toggleFocusMode}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer"
                >
                  {isFocusMode ? <Minimize2 className="w-3.5 h-3.5 text-[#7A7469]" /> : <Maximize2 className="w-3.5 h-3.5 text-[#7A7469]" />}
                  <span>{isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-[#DFD8CC]" />
          </>
        )}

        {/* Clean Ollama Selector - Just Ollama & Icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F3EFE7] border-[#E0D8CB] px-3 py-1.5 rounded-xl text-xs font-medium text-[#2E2B25] shadow-2xs cursor-pointer"
            >
              <OllamaIcon className="w-3.5 h-3.5 text-[#25251F]" />
              <span className="font-semibold text-[#25251F]">Ollama</span>
              <span className="text-[#A59F95]">·</span>
              <span className="text-[#59554C] truncate max-w-[130px]">{selectedModel}</span>
              <ChevronDown className="w-3 h-3 text-[#7C776E] shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 bg-[#FAF7F2] border-[#DDD5C7] rounded-xl shadow-lg p-1.5 z-50 text-xs"
          >
            <DropdownMenuLabel className="px-2 py-1 font-semibold text-[#78736A] text-[10px] uppercase tracking-wider">
              Ollama Models
            </DropdownMenuLabel>
            {modelOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => {
                  setModelRoutingMode(opt.isAuto ? 'auto' : 'manual');
                  setSelectedModel(opt.label);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedModel === opt.label ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0] text-[#3D3A34]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {selectedModel === opt.label && <Check className="w-3.5 h-3.5 text-[#35502A] shrink-0" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};