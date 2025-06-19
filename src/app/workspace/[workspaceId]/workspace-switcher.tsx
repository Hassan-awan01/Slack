"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { useCreateWorkspace } from "@/features/workspace/api/use-create-workspace-hook";
import { useGetWorkspaceDataById } from "@/features/workspace/api/use-get-workspace-ById";
import { useWorkspace } from "@/features/workspace/api/use-workspace-hook";
import { useCreateWorkspaceModel } from "@/features/workspace/store/use-create-workspace-model";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export const WorkspaceSwitcher = () => {
  const [_open, setOpen] = useCreateWorkspaceModel();
  const router = useRouter();
  const workspaceId = useGetWorkspaceId();
  const { data: workspace, isLoading: workspaceLoading } =
    useGetWorkspaceDataById({ workspaceId });
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspace();

  const filteredWorkspaces = workspaces?.filter(
    (workspace) => workspace._id != workspaceId
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-9 relative overflow-hidden bg-[#ABABAD] hover:bg-[#ABABAD] text-slate-800 font-semibold text-xl">
          {workspaceLoading ? (
            <Loader className="size-4 animate-spin shrink-0" />
          ) : (
            workspace?.name.charAt(0).toUpperCase()
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start" side="bottom">
        {/* Active Workspace */}
        <DropdownMenuItem
          onClick={() => router.push(`/workspace/${workspaceId}`)}
          className="w-full px-3 py-2 cursor-pointer flex items-center gap-3 rounded-md hover:bg-accent"
        >
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="truncate font-medium capitalize">
              {workspace?.name}
            </span>
            <span className="text-xs text-muted-foreground leading-none">
              Active workspace
            </span>
          </div>
        </DropdownMenuItem>

        {/* Other Workspaces */}
        {filteredWorkspaces?.map((workspace) => (
          <DropdownMenuItem
            key={workspace._id}
            onClick={() => router.push(`/workspace/${workspace._id}`)}
            className="w-full px-3 py-2 cursor-pointer flex items-center gap-3 rounded-md hover:bg-accent"
          >
            <div className="shrink-0 size-9 flex items-center justify-center bg-[#616061] text-slate-800 font-semibold text-lg rounded-md">
              {workspace?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="truncate font-medium capitalize">
              {workspace?.name}
            </span>
          </DropdownMenuItem>
        ))}

        {/* Create New Workspace */}
        <DropdownMenuItem
          onClick={() => setOpen(true)}
          className="w-full px-3 py-2 cursor-pointer flex items-center gap-3 rounded-md hover:bg-accent"
        >
          <div className="size-9 flex items-center justify-center bg-[#F2F2F2] text-slate-800 font-semibold text-lg rounded-md">
            <Plus />
          </div>
          <span className="font-medium capitalize">Create a workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
