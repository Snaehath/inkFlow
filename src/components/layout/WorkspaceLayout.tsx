import React from 'react';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex bg-[#F5F1E9] text-[#25251F] overflow-hidden font-sans select-none antialiased">
      {/* Global App Sidebar */}
      <AppSidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 flex overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
