import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspaceDataById } from "@/features/workspace/api/use-get-workspace-ById";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";
import { WorkSpaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { UserItem } from "./user-item";
import { useCreateChannelModel } from "@/features/channels/store/use-create-channel-model";
import { useMemo } from "react";
import { useGetChannelId } from "@/hooks/use-Get-Channel-id";

export const WorkspaceSidebar = () => {
  const workspaceId = useGetWorkspaceId();
  const { data: workspaceData, isLoading: workspaceLoading } =
    useGetWorkspaceDataById({ workspaceId });

  const { data: memberData, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });

  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });

  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  const [_open, setOpen] = useCreateChannelModel();
  const isAdmin = useMemo(() => memberData?.role === "admin", [memberData]);
  const channelId = useGetChannelId();

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
  return (
    <div className="flex flex-col bg-[#5E2C5F] h-full">
      <WorkSpaceHeader workspace={workspaceData} isAdmin={isAdmin} />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem
          label="Thread"
          icon={MessageSquareText}
          id="thread"
          // variant="default"
        />
        <SidebarItem
          label="Draft & Sent"
          icon={SendHorizonal}
          id="draft"
          // variant="acti"
        />
      </div>
      <WorkspaceSection
        label="Channels"
        hint="New Channels"
        onNew={isAdmin ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            label={item.name}
            icon={HashIcon}
            id={item._id}
            variant={channelId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection
        label="Direct Messages"
        hint="New Direct Messages"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            key={item._id}
            label={item.user.name}
            image={item.user.image}
            id={item._id}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};
