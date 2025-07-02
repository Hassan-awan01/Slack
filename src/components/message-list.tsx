import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages-hook";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Message } from "./message";
import { ChannelHero } from "./channel-hero";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { Loader } from "lucide-react";
import { ConversationHero } from "@/app/workspace/[workspaceId]/member/[memberId]/conversation-hero";
interface MessageListProps {
  channelName?: string;
  memberName?: string;
  memberImage?: string;
  channelCreationTime?: number;
  variant?: "channel" | "conversation" | "thread";
  data: GetMessagesReturnType | undefined;
  loadMore: () => void;
  isLoadMore: boolean;
  canLoadMore: boolean;
}

const COMPACT_TIME = 5;

export const MessageList = ({
  channelName,
  memberImage,
  memberName,
  channelCreationTime,
  loadMore,
  data = [],
  isLoadMore,
  canLoadMore,
  variant = "channel",
}: MessageListProps) => {
  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const groupedMessages = data.reduce(
    (group, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!group[dateKey]) {
        group[dateKey] = [message]; // First message of the day
      } else {
        group[dateKey].unshift(message); // Add newer messages on top (latest-first)
      }

      return group;
    },
    {} as Record<string, typeof data>
  );
  const workspaceId = useGetWorkspaceId();
  const { data: member } = useCurrentMember({ workspaceId });
  //   console.log(variant, channelCreationTime, channelName);
  // console.log(data);

  return (
    <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
      {Object.entries(groupedMessages).map(([dateKey, messages]) => (
        <div key={dateKey}>
          <div className="text-center my-2 relative">
            <hr className="right-0 left-0 border-t border-gray-300 absolute top-1/2" />
            <span className="relative inline-block bg-white py-1 px-4 border border-gray-300 shadow-sm text-sm rounded-full">
              {formatDayLabel(dateKey)}
            </span>
          </div>

          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const isCompact =
              prevMessage &&
              prevMessage.user._id === message.user._id &&
              differenceInMinutes(
                new Date(message._creationTime),
                new Date(prevMessage._creationTime)
              ) < COMPACT_TIME;
            return (
              <Message
                key={message._id}
                id={message._id}
                memberId={message.memberId}
                authorImage={message.user.image}
                authorName={message.user.name}
                image={message.image}
                body={message.body}
                threadCount={message.threadCount}
                threadImage={message.threadImage}
                threadTimestamp={message.threadTimestamp}
                threadName={message.threadName}
                updatedAt={message.updateAt}
                createdAt={message._creationTime}
                isEditing={editingId === message._id}
                setEditingId={setEditingId}
                isCompact={isCompact}
                hideThreadButton={variant === "thread"}
                isAuthor={member?._id === message.memberId}
                reactions={message.reactions}
              />
            );
          })}
        </div>
      ))}
      <div
        ref={(el) => {
          if (el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting && canLoadMore) {
                  loadMore();
                }
              },
              {
                threshold: 1.0,
              }
            );
            observer.observe(el);

            return () => observer.disconnect();
          }
        }}
      />
      {isLoadMore && (
        <div className="text-center my-2 relative">
          <hr className="right-0 left-0 border-t border-gray-300 absolute top-1/2" />
          <span className="relative inline-block bg-white py-1 px-4 border border-gray-300 shadow-sm text-sm rounded-full">
            <Loader className="size-4 animate-spin" />
          </span>
        </div>
      )}
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero name={channelName} creationTime={channelCreationTime} />
      )}
      {variant === "conversation" && memberName && (
        <ConversationHero name={memberName} image={memberImage} />
      )}
    </div>
  );
};
