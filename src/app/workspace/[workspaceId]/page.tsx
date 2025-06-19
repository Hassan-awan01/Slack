"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannelModel } from "@/features/channels/store/use-create-channel-model";
import { useCurrentMember } from "@/features/members/api/use-current-member";
// import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspaceDataById } from "@/features/workspace/api/use-get-workspace-ById";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";

import { Loader, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const WorkSpacePage = () => {
  const workspaceId = useGetWorkspaceId();
  // const channelId = useGetChannelId();
  const [open, setOpen] = useCreateChannelModel();
  const router = useRouter();

  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } =
    useGetWorkspaceDataById({ workspaceId });

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const channelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => member?.role === "admin", [member]);

  useEffect(() => {
    if (
      channelsLoading ||
      workspaceLoading ||
      memberLoading ||
      !member ||
      !workspace
    )
      return;
    else if (channelId)
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    else if (!open && isAdmin) setOpen(true);
  }, [
    member,
    memberLoading,
    isAdmin,
    channelId,
    channelsLoading,
    workspaceLoading,
    workspaceId,
    router,
    open,
    setOpen,
    workspace,
  ]);
  if (workspaceLoading || channelsLoading) {
    return (
      <div className="flex flex-1 flex-col gap-2 h-full items-center justify-center">
        <Loader className="animate-spin text-muted-foreground size-6" />
      </div>
    );
  }
  if (!workspace || !member) {
    return (
      <div className="flex flex-1 flex-col gap-2 h-full items-center justify-center">
        <TriangleAlert className=" text-muted-foreground size-6" />
        <span className="text-sm text-muted-foreground">Channel not Found</span>
      </div>
    );
  }

  return null;
};

export default WorkSpacePage;
