import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { 
  CharacterEntity, 
  LocationEntity, 
  WorldLoreEntity, 
  PlotThread, 
  StoryPromise,
  BrainCategory 
} from '../../types';
import { 
  Users, 
  MapPin, 
  Sparkles, 
  BookMarked, 
  Crosshair, 
  Plus, 
  Eye
} from 'lucide-react';

export const StoryBrainWorkspace: React.FC = () => {
  const { 
    activeProjectId, 
    selectedBrainCategory, 
    setSelectedBrainCategory,
    selectedBrainEntityId,
    setSelectedBrainEntityId 
  } = useInkFlowStore();

  const [characters, setCharacters] = useState<CharacterEntity[]>([]);
  const [locations, setLocations] = useState<LocationEntity[]>([]);
  const [worldLore, setWorldLore] = useState<WorldLoreEntity[]>([]);
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>([]);
  const [promises, setPromises] = useState<StoryPromise[]>([]);

  useEffect(() => {
    const loadBrainData = async () => {
      const chars = await db.characters.where('projectId').equals(activeProjectId).toArray();
      setCharacters(chars);

      const locs = await db.locations.where('projectId').equals(activeProjectId).toArray();
      setLocations(locs);

      const lore = await db.worldLore.where('projectId').equals(activeProjectId).toArray();
      setWorldLore(lore);

      const plots = await db.plotThreads.where('projectId').equals(activeProjectId).toArray();
      setPlotThreads(plots);

      const proms = await db.promises.where('projectId').equals(activeProjectId).toArray();
      setPromises(proms);

      if (!selectedBrainEntityId && chars.length > 0) {
        setSelectedBrainEntityId(chars[0].id);
      }
    };
    loadBrainData();
  }, [activeProjectId, selectedBrainEntityId, setSelectedBrainEntityId]);

  const categories: { id: BrainCategory; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'characters', label: 'Characters', icon: Users, count: characters.length },
    { id: 'locations', label: 'Locations', icon: MapPin, count: locations.length },
    { id: 'lore', label: 'World Lore', icon: BookMarked, count: worldLore.length },
    { id: 'plots', label: 'Plot Threads', icon: Crosshair, count: plotThreads.length },
    { id: 'promises', label: 'Chekhov Guns & Promises', icon: Sparkles, count: promises.length },
  ];

  const activeChar = characters.find((c) => c.id === selectedBrainEntityId) || characters[0];
  const activeLoc = locations.find((l) => l.id === selectedBrainEntityId) || locations[0];
  const activeLore = worldLore.find((l) => l.id === selectedBrainEntityId) || worldLore[0];
  const activePlot = plotThreads.find((p) => p.id === selectedBrainEntityId) || plotThreads[0];
  const activePromise = promises.find((p) => p.id === selectedBrainEntityId) || promises[0];

  return (
    <div className="flex-1 flex h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden font-sans text-xs">
      {/* 1. Category Nav Sidebar */}
      <aside className="w-56 bg-[#0E1117] border-r border-[#1C212B] flex flex-col h-full shrink-0">
        <div className="p-3 border-b border-[#1C212B] bg-[#0A0C0F]">
          <span className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-['Outfit']">
            Story Brain
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">Narrative Database & State</p>
        </div>

        <div className="p-2 space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedBrainCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedBrainCategory(cat.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors font-medium ${
                  isSelected
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151922]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                  <span>{cat.label}</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#161B23]">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2. Entity List Column */}
      <div className="w-64 bg-[#0A0C10] border-r border-[#1C212B] flex flex-col h-full shrink-0">
        <div className="p-3 border-b border-[#1C212B] flex items-center justify-between">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
            {selectedBrainCategory} Registry
          </span>
          <button className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white" title="Add Entity">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {selectedBrainCategory === 'characters' &&
            characters.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedBrainEntityId(c.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                  selectedBrainEntityId === c.id
                    ? 'bg-violet-950/60 border-violet-500/50 text-white font-semibold'
                    : 'bg-[#12151D] border-transparent text-slate-300 hover:bg-[#161B26]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] capitalize text-violet-400">{c.role}</span>
                </div>
              </div>
            ))}

          {selectedBrainCategory === 'locations' &&
            locations.map((l) => (
              <div
                key={l.id}
                onClick={() => setSelectedBrainEntityId(l.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                  selectedBrainEntityId === l.id
                    ? 'bg-violet-950/60 border-violet-500/50 text-white font-semibold'
                    : 'bg-[#12151D] border-transparent text-slate-300 hover:bg-[#161B26]'
                }`}
              >
                <span className="truncate block font-medium">{l.name}</span>
                <span className="text-[10px] text-slate-500 block truncate">{l.type}</span>
              </div>
            ))}

          {selectedBrainCategory === 'lore' &&
            worldLore.map((l) => (
              <div
                key={l.id}
                onClick={() => setSelectedBrainEntityId(l.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                  selectedBrainEntityId === l.id
                    ? 'bg-violet-950/60 border-violet-500/50 text-white font-semibold'
                    : 'bg-[#12151D] border-transparent text-slate-300 hover:bg-[#161B26]'
                }`}
              >
                <span className="truncate block font-medium">{l.title}</span>
                <span className="text-[10px] uppercase text-violet-400 font-mono">{l.category}</span>
              </div>
            ))}

          {selectedBrainCategory === 'plots' &&
            plotThreads.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedBrainEntityId(p.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                  selectedBrainEntityId === p.id
                    ? 'bg-violet-950/60 border-violet-500/50 text-white font-semibold'
                    : 'bg-[#12151D] border-transparent text-slate-300 hover:bg-[#161B26]'
                }`}
              >
                <span className="truncate block font-medium">{p.title}</span>
                <span className="text-[10px] capitalize text-emerald-400 font-mono">{p.status}</span>
              </div>
            ))}

          {selectedBrainCategory === 'promises' &&
            promises.map((pr) => (
              <div
                key={pr.id}
                onClick={() => setSelectedBrainEntityId(pr.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                  selectedBrainEntityId === pr.id
                    ? 'bg-violet-950/60 border-violet-500/50 text-white font-semibold'
                    : 'bg-[#12151D] border-transparent text-slate-300 hover:bg-[#161B26]'
                }`}
              >
                <span className="truncate block font-medium">{pr.title}</span>
                <span className="text-[10px] capitalize text-amber-400 font-mono">{pr.promiseType}</span>
              </div>
            ))}
        </div>
      </div>

      {/* 3. Detail & Temporal State Inspector Panel */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#0B0D10]">
        {selectedBrainCategory === 'characters' && activeChar && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1C212B] pb-4">
              <div>
                <h2 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                  {activeChar.name}
                  <span className="text-xs font-normal px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30 capitalize">
                    {activeChar.role}
                  </span>
                </h2>
                <p className="text-slate-400 text-[11px] mt-0.5">{activeChar.occupation || 'No occupation specified'}</p>
              </div>
            </div>

            {/* Temporal Knowledge State (The Killer Feature) */}
            <div className="bg-[#121622] border border-[#20283C] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold text-xs text-violet-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-violet-400" />
                  Temporal Knowledge State (Current Active Scene)
                </span>
                <span className="text-[10px] font-mono text-slate-500">Auto-Maintained by Story Runtime</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="text-emerald-300 font-medium">✓ Known Facts:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                  <li>Victor is inside Castle Black and conducting ritual ceremonies.</li>
                  <li>Grandfather\'s silver ring functions as an alchemical key.</li>
                  <li>Outer courtyard was abandoned without Crown authorization.</li>
                </ul>
              </div>

              <div className="space-y-1.5 text-[11px] pt-2 border-t border-[#1C2436]">
                <div className="text-rose-300 font-medium">⚠ False Beliefs / Blindspots:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                  <li>Believes the High Guild is actively opposing Victor\'s ritual.</li>
                </ul>
              </div>
            </div>

            {/* Voice & Relationships */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#10131B] border border-[#1C212B] rounded-xl p-3.5 space-y-2">
                <span className="font-semibold text-[11px] text-slate-300">Voice & Psychological Guideline</span>
                <p className="text-slate-400 italic text-[11px]">"{activeChar.voiceNotes || 'Standard cadence.'}"</p>
              </div>

              <div className="bg-[#10131B] border border-[#1C212B] rounded-xl p-3.5 space-y-2">
                <span className="font-semibold text-[11px] text-slate-300">Relationships & Trust</span>
                <div className="space-y-1.5">
                  {activeChar.relationships.map((rel) => (
                    <div key={rel.targetCharacterId} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>{rel.targetName}</span>
                      <span className={`font-mono text-[10px] ${rel.trustScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {rel.trustScore > 0 ? `+${rel.trustScore}` : rel.trustScore} trust
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedBrainCategory === 'promises' && activePromise && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
              {activePromise.title}
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                {activePromise.promiseType}
              </span>
            </h2>
            <div className="bg-[#121622] border border-[#20283C] rounded-xl p-4 space-y-2 text-slate-300">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-mono text-emerald-400 font-semibold">{activePromise.status}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Foreshadowing Age:</span>
                <span className="font-mono text-amber-400">{activePromise.ageScenes || 0} scenes ago</span>
              </div>
              <p className="text-slate-400 text-[11px] pt-2 border-t border-[#1C2436]">
                {activePromise.notes || 'No notes provided.'}
              </p>
            </div>
          </div>
        )}

        {selectedBrainCategory === 'locations' && activeLoc && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-slate-100">{activeLoc.name}</h2>
            <p className="text-slate-300">{activeLoc.description}</p>
            {activeLoc.sensoryDetails && (
              <div className="p-3 rounded-lg bg-[#141824] border border-[#202636] text-[11px] text-slate-400">
                <strong className="text-slate-200">Sensory Details:</strong> {activeLoc.sensoryDetails}
              </div>
            )}
          </div>
        )}

        {selectedBrainCategory === 'lore' && activeLore && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-slate-100">{activeLore.title}</h2>
            <p className="text-slate-300">{activeLore.description}</p>
            {activeLore.rulesAndCosts && (
              <div className="p-3 rounded-lg bg-[#141824] border border-[#202636] text-[11px] text-slate-400">
                <strong className="text-rose-300">Rules & Costs:</strong> {activeLore.rulesAndCosts}
              </div>
            )}
          </div>
        )}

        {selectedBrainCategory === 'plots' && activePlot && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-slate-100">{activePlot.title}</h2>
            <p className="text-slate-300">{activePlot.description}</p>
            <div className="p-3 rounded-lg bg-[#141824] border border-[#202636] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status: <strong className="text-emerald-400 capitalize">{activePlot.status}</strong></span>
              <span>Related Characters: {activePlot.relatedCharacters.join(', ')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
