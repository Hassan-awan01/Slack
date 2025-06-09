"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

const WorkSpacePage = () => {
  const workspaceId = useWorkspaceId();
  return <div>{workspaceId}</div>;
};

export default WorkSpacePage;
