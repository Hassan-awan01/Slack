"use client";

import { useGetOrCreateConversation } from "@/features/conversation/api/use-GetOrCreate-conversation";
import { useGetMemberId } from "@/hooks/use-Get-member-id";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Conversation } from "./conversation";

const MemberIdPage = () => {
  const workspaceId = useGetWorkspaceId();
  const memberId = useGetMemberId();
  const { data, mutate, isPending } = useGetOrCreateConversation();
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  useEffect(() => {
    mutate(
      {
        workspaceId,
        memberId,
      },
      {
        onSuccess: () => {
          setConversationId(data);
        },
      }
    );
  }, [workspaceId, memberId, mutate, data]);

  if (isPending) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader className="animate-spin text-muted-foreground size-5" />
      </div>
    );
  }
  if (!conversationId) {
    return (
      <div className="flex flex-col gap-y-2 h-full items-center justify-center">
        <AlertTriangle className=" text-muted-foreground size-5" />
        <span className="text-sm text-muted-foreground">
          Conversation not Found
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Conversation conversationId={conversationId} />
    </div>
  );
};

export default MemberIdPage;
