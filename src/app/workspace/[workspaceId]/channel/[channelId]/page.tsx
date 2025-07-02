"use client";
// import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetChannelById } from "@/features/channels/api/use-get-channels-byId";
import { useGetChannelId } from "@/hooks/use-Get-Channel-id";
import { Loader, TriangleAlert } from "lucide-react";
import { Header } from "./Header";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages-hook";
import { MessageList } from "@/components/message-list";
import { useRef } from "react";

const ChannelIdPage = () => {
  const channelId = useGetChannelId();
  const { data: channel, isLoading: channelLoading } = useGetChannelById({
    channelId,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const { results, status, loadMore } = useGetMessages({ channelId });

  if (channelLoading || status === "LoadingFirstPage") {
    return (
      <div className="flex flex-1 flex-col gap-2 h-full items-center justify-center">
        <Loader className="animate-spin text-muted-foreground size-6" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-1 flex-col gap-2 h-full items-center justify-center">
        <TriangleAlert className=" text-muted-foreground size-6" />
        <span className="text-sm text-muted-foreground">Channel not Found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel?.name} />
      <MessageList
        channelName={channel?.name}
        channelCreationTime={channel?._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeholder={channel?.name} />
    </div>
  );
};

export default ChannelIdPage;
