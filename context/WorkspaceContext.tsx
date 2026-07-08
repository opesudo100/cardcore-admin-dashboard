"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Workspace = "core" | "cloud";

interface WorkspaceContextType {
  workspace: Workspace;
  setWorkspace: (ws: Workspace) => void;
  toggleWorkspace: () => void;
  isCloudCard: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace>("core");

  useEffect(() => {
    const saved = localStorage.getItem("app");
    if (saved === "cloud" || saved === "core") {
      setWorkspaceState(saved);
    }
  }, []);

  const setWorkspace = (ws: Workspace) => {
    setWorkspaceState(ws);
    localStorage.setItem("app", ws);
  };

  const toggleWorkspace = () => {
    const nextWs = workspace === "core" ? "cloud" : "core";
    setWorkspace(nextWs);
  };

  const isCloudCard = workspace === "cloud";

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        setWorkspace,
        toggleWorkspace,
        isCloudCard,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
