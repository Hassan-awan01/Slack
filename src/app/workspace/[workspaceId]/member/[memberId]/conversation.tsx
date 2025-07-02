import { useGetMemberId } from "@/hooks/use-Get-member-id";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages-hook";
import { Loader } from "lucide-react";
import { Header } from "./Header";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";

interface ConversationProps {
  conversationId: Id<"conversations">;
}

export const Conversation = ({ conversationId }: ConversationProps) => {
  const memberId = useGetMemberId();
  const { onOpenProfile } = usePanel();
  const { data: member, isLoading: memberLoading } = useGetMember({ memberId });
  const { results, status, loadMore } = useGetMessages({
    conversationId,
  });

  if (memberLoading || status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader className="animate-spin text-muted-foreground size-5" />
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <Header
        memberImage={member?.user.image}
        onClick={() => onOpenProfile(memberId)}
        memberName={member?.user.name}
      />
      <MessageList
        data={results}
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        isLoadMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
        variant="conversation"
      />
      <ChatInput
        placeholder={`Message ${member?.user.name}`}
        conversationId={conversationId}
      />
    </div>
  );
};
