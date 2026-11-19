import { useEffect } from 'react';
import { seedInitialDemoData } from './storage/DexieStorage';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import { Studio } from './pages/Studio';
import { Editor } from './pages/Editor';
import { Skills } from './pages/Skills';
import { Projects } from './pages/Projects';
import { Templates } from './pages/Templates';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { checkOllamaConnection } from './lib/ollama';
import { useInkFlowStore } from './store/useInkFlowStore';

export function App() {
  const { 
    currentScreen,
    setActiveProjectId, 
    setActiveSceneId,
    setOllamaStatus,
    setAvailableModels,
    setSelectedModel
  } = useInkFlowStore();

  useEffect(() => {
    // Seed initial demonstration story if empty
    seedInitialDemoData().then(({ projectId, sceneId }) => {
      setActiveProjectId(projectId);
      setActiveSceneId(sceneId);
    });

    // Check local Ollama and detect installed models directly
    checkOllamaConnection().then(({ connected, rawNames }) => {
      setOllamaStatus(connected ? 'connected' : 'disconnected');
      if (rawNames && rawNames.length > 0) {
        setAvailableModels(rawNames);
        setSelectedModel('Auto (Task Router)');
      }
    });
  }, [setActiveProjectId, setActiveSceneId, setOllamaStatus, setAvailableModels, setSelectedModel]);

  return (
    <WorkspaceLayout>
      {currentScreen === 'studio' && <Studio />}
      {currentScreen === 'editor' && <Editor />}
      {currentScreen === 'skills' && <Skills />}
      {currentScreen === 'projects' && <Projects />}
      {currentScreen === 'templates' && <Templates />}

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />
    </WorkspaceLayout>
  );
}

export default App;
