import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { LinterIssue } from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  X, 
  Sparkles
} from 'lucide-react';

export const ReviewWorkspace: React.FC = () => {
  const { activeProjectId, setActiveSceneId, setActiveMode, setDiffProposal } = useInkFlowStore();
  const [issues, setIssues] = useState<LinterIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeCompareIssue, setActiveCompareIssue] = useState<LinterIssue | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchIssues = async () => {
      const list = await db.linterIssues.toArray();
      if (isMounted) setIssues(list);
    };
    fetchIssues();
    return () => {
      isMounted = false;
    };
  }, [activeProjectId]);

  const handleDismiss = async (id: string) => {
    await db.linterIssues.update(id, { status: 'dismissed' });
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'dismissed' } : i)));
  };

  const handleApplyFix = (issue: LinterIssue) => {
    if (issue.suggestedFix) {
      setDiffProposal({
        originalText: issue.excerpt || '',
        suggestedText: issue.suggestedFix,
        rationale: issue.explanation,
        actionType: 'rewrite',
      });
      setActiveSceneId(issue.sceneId);
      setActiveMode('write');
    }
  };

  const handleReRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  const activeIssues = issues.filter((i) => i.status === 'active');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden font-sans text-xs">
      {/* Linter Header */}
      <div className="h-11 bg-[#0E1117] border-b border-[#1C212B] px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-['Outfit']">
            Story Linter & Continuity Studio
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">
            {activeIssues.length === 0
              ? '✓ No continuity issues found'
              : `${activeIssues.length} items worth checking`}
          </span>
        </div>

        <button
          onClick={handleReRunScan}
          disabled={isScanning}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#161B23] border border-slate-800 hover:border-slate-700 text-slate-300 font-medium transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-violet-400' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Re-run Linter'}</span>
        </button>
      </div>

      {/* Linter Diagnostics List */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-4 w-full">
        {activeIssues.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-slate-100 text-sm">Your story is consistent</h3>
            <p className="text-slate-400 text-[11px]">
              No character knowledge discrepancies, timeline hops, or abandoned Chekhov promises detected.
            </p>
          </div>
        ) : (
          activeIssues.map((issue) => (
            <div
              key={issue.id}
              className={`bg-[#0E1117] border rounded-xl p-4 space-y-3 shadow-sm ${
                issue.severity === 'warning'
                  ? 'border-amber-500/30'
                  : 'border-cyan-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {issue.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <h4 className="font-semibold text-slate-100 text-[13px]">{issue.title}</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B23] text-slate-400">
                  {issue.sceneTitle}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed text-[11px]">{issue.explanation}</p>

              {issue.excerpt && (
                <div className="p-2.5 rounded-lg bg-[#141822] border border-[#202738] font-['Newsreader'] text-slate-300 italic text-[12px]">
                  {issue.excerpt}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#1C212B] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {issue.conflictingSceneTitle && (
                    <button
                      onClick={() => setActiveCompareIssue(issue)}
                      className="px-2.5 py-1 rounded bg-[#161B23] border border-slate-700 hover:border-slate-600 text-slate-300 transition-colors text-[11px]"
                    >
                      Compare with {issue.conflictingSceneTitle}
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(issue.id)}
                    className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
                  >
                    This is Intentional
                  </button>
                </div>

                {issue.suggestedFix && (
                  <button
                    onClick={() => handleApplyFix(issue)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-sm text-[11px]"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Apply Suggested Fix</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Side-by-Side Scene Compare Modal */}
      {activeCompareIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-3xl bg-[#0E1117] border border-[#232A3B] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3 bg-[#0A0C10] border-b border-[#1C212B] flex items-center justify-between">
              <span className="font-semibold text-slate-100 text-[11px] uppercase tracking-wider">
                Cross-Scene Continuity Comparison
              </span>
              <button
                onClick={() => setActiveCompareIssue(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-violet-400">
                  {activeCompareIssue.conflictingSceneTitle} (Past)
                </span>
                <div className="p-3 rounded-lg bg-[#141720] border border-[#202636] text-[11px] text-slate-300 font-['Newsreader']">
                  "I don't know who they are, Vance. I have never laid eyes on a High Guild official in my life."
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-rose-400">
                  {activeCompareIssue.sceneTitle} (Current)
                </span>
                <div className="p-3 rounded-lg bg-[#141720] border border-[#202636] text-[11px] text-slate-300 font-['Newsreader']">
                  {activeCompareIssue.excerpt}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0A0C10] border-t border-[#1C212B] flex justify-end">
              <button
                onClick={() => setActiveCompareIssue(null)}
                className="px-3 py-1.5 rounded bg-violet-600 text-white font-medium text-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
