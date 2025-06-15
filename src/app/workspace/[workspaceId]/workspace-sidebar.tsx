import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspaceDataById } from "@/features/workspace/api/use-get-workspace-ById";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { WorkSpaceHeader } from "./workspace-header";

export const WorkspaceSidebar = () => {
  const id = useGetWorkspaceId();
  const workspaceId = id;
  const { data: workspaceData, isLoading: workspaceLoading } =
    useGetWorkspaceDataById({ id });

  const { data: memberData, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });

  const isAdmin = memberData?.role === "admin";

  if (memberLoading || workspaceLoading) {
    return (
      <div className="flex flex-col h-full bg-[#5E2C5F] items-center justify-center">
        <Loader className="animate-spin text-white size-5" />
      </div>
    );
  }
  if (!memberData && !workspaceData) {
    return (
      <div className="flex flex-col h-full bg-[#5E2C5F] items-center justify-center">
        <AlertTriangle className="text-white size-5" />
        <p className="text-white text-sm">WorkSpace not found</p>
      </div>
    );
  }
  return <WorkSpaceHeader workspace={workspaceData} isAdmin={isAdmin} />;
};
