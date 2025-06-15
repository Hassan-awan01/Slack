"use client";
import React from "react";
import { ToolBar } from "./toolbar";
import { Sidebar } from "./sidebar";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WorkspaceSidebar } from "./workspace-sidebar";

interface WorkSpaceLayoutProps {
  children: React.ReactNode;
}

const WorkSpaceLayout = ({ children }: WorkSpaceLayoutProps) => {
  return (
    <div className="h-full">
      <ToolBar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <ResizablePanelGroup direction="horizontal" autoSaveId="hi-workspace">
          <ResizablePanel
            defaultSize={20}
            minSize={20}
            className=" bg-[#5E2C5F]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={15}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkSpaceLayout;
