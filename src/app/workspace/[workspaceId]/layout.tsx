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
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { Thread } from "@/components/thread";
import { Id } from "../../../../convex/_generated/dataModel";
import { Profile } from "@/components/profile";

interface WorkSpaceLayoutProps {
  children: React.ReactNode;
}

const WorkSpaceLayout = ({ children }: WorkSpaceLayoutProps) => {
  const { parentMessageId, onClose, memberProfileId } = usePanel();
  const showPanel = !!parentMessageId || memberProfileId;
  return (
    <div className="h-full">
      <ToolBar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <ResizablePanelGroup direction="horizontal" autoSaveId="hi-workspace">
          <ResizablePanel
            defaultSize={15}
            minSize={15}
            className="bg-[#5E2C5F]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={55} minSize={20}>
            {children}
          </ResizablePanel>

          {showPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20}>
                {parentMessageId ? (
                  <Thread
                    messageId={parentMessageId as Id<"messages">}
                    onClose={onClose}
                  />
                ) : memberProfileId ? (
                  <Profile
                    memberId={memberProfileId as Id<"members">}
                    onClose={onClose}
                  />
                ) : (
                  <div className="flex flex-col h-full items-center justify-center">
                    <Loader className="animate-spin text-muted-foreground size-5" />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkSpaceLayout;
