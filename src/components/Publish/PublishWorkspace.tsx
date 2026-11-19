import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { Chapter, Scene } from '../../types';
import { 
  BookOpen, 
  Download, 
  Printer, 
  FileType, 
  Sliders
} from 'lucide-react';

export const PublishWorkspace: React.FC = () => {
  const { activeProjectId } = useInkFlowStore();
  const [projectTitle, setProjectTitle] = useState('The Shadow of Castle Black');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [theme, setTheme] = useState<'classic' | 'minimal' | 'noir'>('classic');
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [includeCopyright, setIncludeCopyright] = useState(true);

  useEffect(() => {
    const load = async () => {
      const proj = await db.projects.get(activeProjectId);
      if (proj) setProjectTitle(proj.title);

      const chs = await db.chapters.where('projectId').equals(activeProjectId).sortBy('order');
      setChapters(chs);

      const scs = await db.scenes.where('projectId').equals(activeProjectId).sortBy('order');
      setScenes(scs);
    };
    load();
  }, [activeProjectId]);

  const compiledManuscriptText = chapters
    .map((ch) => {
      const chScenes = scenes.filter((s) => s.chapterId === ch.id);
      const sceneTexts = chScenes
        .map((sc) => {
          return `${sc.title.toUpperCase()}\n\n` + sc.contentHtml.replace(/<[^>]+>/g, '').trim();
        })
        .join('\n\n* * *\n\n');
      return `${ch.title}\n\n${sceneTexts}`;
    })
    .join('\n\n\n════════════════════════════════════════\n\n\n');

  // Export 1: Plain Text (.txt)
  const handleExportTxt = () => {
    const blob = new Blob([compiledManuscriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '_')}_Manuscript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export 2: Word Document (.doc / .docx compatible HTML)
  const handleExportWord = () => {
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${projectTitle}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 1in; }
        h1 { font-size: 24pt; text-align: center; margin-top: 2in; margin-bottom: 0.5in; }
        .chapter-title { page-break-before: always; font-size: 18pt; text-align: center; margin-top: 1in; margin-bottom: 0.5in; }
        p { text-indent: 0.5in; margin-bottom: 0.1in; }
      </style>
      </head>
      <body>
        ${includeTitlePage ? `<h1>${projectTitle}</h1><p style="text-align:center;">By Author</p>` : ''}
        ${chapters
          .map((ch) => {
            const chScenes = scenes.filter((s) => s.chapterId === ch.id);
            return `<h2 class="chapter-title">${ch.title}</h2>${chScenes.map((s) => s.contentHtml).join('')}`;
          })
          .join('')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '_')}_Manuscript.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export 3: PDF Print Studio
  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>${projectTitle}</title>
        <style>
          @page { size: 6in 9in; margin: 0.75in; }
          body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.65; color: #111; }
          h1.book-title { font-size: 26pt; text-align: center; margin-top: 2.5in; }
          .page-break { page-break-before: always; }
          h2.chapter-heading { font-size: 16pt; text-align: center; margin-top: 1.5in; letter-spacing: 0.05em; text-transform: uppercase; }
          p { text-indent: 0.35in; margin-bottom: 0; margin-top: 0; }
        </style>
      </head>
      <body>
        <h1 class="book-title">${projectTitle}</h1>
        ${chapters
          .map((ch) => {
            const chScenes = scenes.filter((s) => s.chapterId === ch.id);
            return `<div class="page-break"><h2 class="chapter-heading">${ch.title}</h2>${chScenes.map((s) => s.contentHtml).join('')}</div>`;
          })
          .join('')}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="flex-1 flex h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden font-sans text-xs">
      {/* 1. Left Publishing Options Sidebar */}
      <aside className="w-80 bg-[#0E1117] border-r border-[#1C212B] flex flex-col h-full shrink-0">
        <div className="p-3 border-b border-[#1C212B] bg-[#0A0C0F] flex items-center justify-between">
          <span className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-['Outfit']">
            Publishing Studio
          </span>
          <Sliders className="w-3.5 h-3.5 text-violet-400" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Typography Theme */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Book Typography Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['classic', 'minimal', 'noir'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-2 rounded-lg border text-center capitalize transition-all ${
                    theme === t
                      ? 'bg-violet-600/30 border-violet-500/50 text-white font-semibold'
                      : 'bg-[#141722] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Front Matter */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Front Matter
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTitlePage}
                  onChange={(e) => setIncludeTitlePage(e.target.checked)}
                  className="rounded bg-[#141722] border-slate-700 text-violet-600 focus:ring-0"
                />
                <span>Include Title Page</span>
              </label>
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCopyright}
                  onChange={(e) => setIncludeCopyright(e.target.checked)}
                  className="rounded bg-[#141722] border-slate-700 text-violet-600 focus:ring-0"
                />
                <span>Include Copyright Page</span>
              </label>
            </div>
          </div>

          {/* Export Actions */}
          <div className="pt-4 border-t border-[#1C212B] space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Compile & Export
            </label>

            <button
              onClick={handleExportWord}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#141722] border border-[#232A3B] hover:border-violet-500/50 text-slate-200 font-medium transition-all"
            >
              <div className="flex items-center space-x-2">
                <FileType className="w-4 h-4 text-blue-400" />
                <span>Microsoft Word (.doc)</span>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={handleExportPdf}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#141722] border border-[#232A3B] hover:border-violet-500/50 text-slate-200 font-medium transition-all"
            >
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print-Ready PDF</span>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={handleExportTxt}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#141722] border border-[#232A3B] hover:border-violet-500/50 text-slate-200 font-medium transition-all"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <span>Plain Text (.txt)</span>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Right Live Book Preview */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-[#07090C]">
        <div className="w-full max-w-xl bg-[#FAF9F5] text-[#1E1E1E] p-12 rounded-lg shadow-2xl min-h-[700px] font-['Newsreader']">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold tracking-tight mb-2 font-['Outfit']">{projectTitle}</h1>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-sans">A Novel</p>
          </div>

          <div className="border-t border-slate-300 pt-8 space-y-6">
            <h2 className="text-center text-sm uppercase tracking-wider font-semibold font-sans text-slate-700">
              Chapter I · The Arrival
            </h2>
            <p className="text-sm leading-relaxed text-justify text-indent-8">
              The night cold cut through Detective Emma's woolen coat like broken glass as her carriage lurched to a halt in front of Castle Black. Rain lashed against the ancient granite walls, carrying with it the iron tang of fresh blood.
            </p>
            <p className="text-sm leading-relaxed text-justify text-indent-8">
              "We don't go any closer, miss," the coachman grunted, his fingers white on the reins. "The northern winds carry voices tonight."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
