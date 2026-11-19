import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { Scene, CharacterEntity, LocationEntity } from '../../types';
import { 
  User, 
  MapPin, 
  Target, 
  ShieldAlert, 
  CheckSquare, 
  Square, 
  ChevronRight, 
  Info,
  Clock
} from 'lucide-react';

interface SceneContextPanelProps {
  scene: Scene | null;
  onUpdateScene: (updated: Partial<Scene>) => void;
}

export const SceneContextPanel: React.FC<SceneContextPanelProps> = ({ scene, onUpdateScene }) => {
  const { isSceneContextOpen, toggleSceneContext, openBrainEntity } = useInkFlowStore();
  const [povCharacter, setPovCharacter] = useState<CharacterEntity | null>(null);
  const [location, setLocation] = useState<LocationEntity | null>(null);

  useEffect(() => {
    if (!scene) return;
    const loadEntities = async () => {
      if (scene.povCharacterId) {
        const char = await db.characters.get(scene.povCharacterId);
        setPovCharacter(char || null);
      } else {
        setPovCharacter(null);
      }

      if (scene.locationId) {
        const loc = await db.locations.get(scene.locationId);
        setLocation(loc || null);
      } else {
        setLocation(null);
      }
    };
    loadEntities();
  }, [scene]);

  if (!isSceneContextOpen || !scene) return null;

  const toggleBeat = (beatId: string) => {
    const updatedBeats = scene.beats.map((b) =>
      b.id === beatId ? { ...b, completed: !b.completed } : b
    );
    onUpdateScene({ beats: updatedBeats });
  };

  return (
    <aside className="w-80 bg-[#0E1117] border-l border-[#1C212B] flex flex-col h-full select-none text-xs text-slate-300 z-10 font-sans">
      {/* Header */}
      <div className="p-3 border-b border-[#1C212B] bg-[#0A0C0F] flex items-center justify-between">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
          <Info className="w-3.5 h-3.5 text-violet-400" />
          <span>Scene Context</span>
        </div>
        <button
          onClick={toggleSceneContext}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Context Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* POV Character Card with Peek & In-Place Inspector */}
        <div className="bg-[#141720] border border-[#202636] rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-violet-400" />
              POV Character
            </span>
            {povCharacter && (
              <button
                onClick={() => openBrainEntity('characters', povCharacter.id)}
                className="text-[10px] text-violet-400 hover:text-violet-300 underline font-mono"
              >
                Inspect ➔
              </button>
            )}
          </div>
          <div className="font-medium text-slate-100 flex items-center justify-between">
            <span>{povCharacter ? povCharacter.name : 'Unassigned'}</span>
            {povCharacter?.role && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30 capitalize">
                {povCharacter.role}
              </span>
            )}
          </div>
          {povCharacter?.voiceNotes && (
            <p className="text-[11px] text-slate-400 italic">"{povCharacter.voiceNotes}"</p>
          )}
        </div>

        {/* Location & Time */}
        <div className="bg-[#141720] border border-[#202636] rounded-lg p-2.5 space-y-2">
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                Setting & Location
              </span>
              {location && (
                <button
                  onClick={() => openBrainEntity('locations', location.id)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                >
                  Inspect ➔
                </button>
              )}
            </div>
            <div className="font-medium text-slate-100">
              {location ? location.name : 'Unknown Location'}
            </div>
            {location?.sensoryDetails && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-slate-500">Sensory:</span> {location.sensoryDetails}
              </div>
            )}
          </div>

          {scene.storyTime && (
            <div className="pt-2 border-t border-[#1C2232] flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{scene.storyTime}</span>
            </div>
          )}
        </div>

        {/* Dramatic Objective (Goal & Conflict) */}
        <div className="bg-[#141720] border border-[#202636] rounded-lg p-2.5 space-y-2.5">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              <Target className="w-3 h-3 text-emerald-400" />
              Scene Goal
            </div>
            <div className="text-[11px] text-slate-200">
              {scene.sceneGoal || 'No dramatic goal defined yet.'}
            </div>
          </div>

          <div className="pt-2 border-t border-[#1C2232]">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              Central Conflict / Obstacle
            </div>
            <div className="text-[11px] text-slate-300">
              {scene.conflict || 'No direct obstacle established.'}
            </div>
          </div>
        </div>

        {/* Scene Beats Checklist */}
        <div className="bg-[#141720] border border-[#202636] rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <span>Narrative Beats</span>
            <span className="font-mono text-violet-400">
              {scene.beats.filter((b) => b.completed).length} / {scene.beats.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {scene.beats.map((beat) => (
              <div
                key={beat.id}
                onClick={() => toggleBeat(beat.id)}
                className={`flex items-start space-x-2 p-1.5 rounded cursor-pointer transition-colors ${
                  beat.completed
                    ? 'text-slate-500 line-through'
                    : 'text-slate-200 hover:bg-[#1A1F2C]'
                }`}
              >
                {beat.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] leading-tight">{beat.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Characters Present */}
        {scene.charactersPresent.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-1">
              Characters in Scene
            </div>
            <div className="flex flex-wrap gap-1.5">
              {scene.charactersPresent.map((cId) => (
                <button
                  key={cId}
                  onClick={() => openBrainEntity('characters', cId)}
                  className="px-2 py-0.5 rounded bg-[#161B24] border border-slate-800 text-[11px] text-slate-300 hover:border-violet-500 hover:text-white transition-colors"
                >
                  {cId.replace('char-', '').replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
