import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { useGetMessageById } from "@/features/messages/api/use-get-message-Info-ById";
import { Message } from "./message";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useCreateMessage } from "@/features/messages/api/use-create-message-hook";
import { useGenerateUploadUrl } from "@/features/upload/api/use-upload-image-hook";
import Quill from "quill";
import { toast } from "sonner";
import { useGetChannelId } from "@/hooks/use-Get-Channel-id";
import { useGetMessages } from "@/features/messages/api/use-get-messages-hook";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

type CreateMessageValues = {
  body: string;
  workspaceId: Id<"workSpaces">;
  parentMessageId: Id<"messages">;
  channelId?: Id<"channels">;
  image: Id<"_storage"> | undefined;
};

const formatDayLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
};

const COMPACT_TIME = 5;

export const Thread = ({ messageId, onClose }: ThreadProps) => {
  const workspaceId = useGetWorkspaceId();
  const channelId = useGetChannelId();

  const { data: member } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: messageLoading } = useGetMessageById({
    messageId,
  });

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const [prevKey, setPreviousKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const isLoadMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  const editorRef = useRef<Quill | null>(null);

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef.current?.enable(false);
      const values: CreateMessageValues = {
        workspaceId,
        channelId,
        parentMessageId: messageId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });
        const result = await fetch(url!, {
          method: "POST",
          headers: { "Content-Type": image!.type },
          body: image,
        });

        if (!result.ok) throw new Error("Failed to upload Image");

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, {
        throwError: true,
      });
      setPreviousKey((prevKey) => prevKey + 1);
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  const groupedMessages = results.reduce(
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
    {} as Record<string, typeof results>
  );

  if (messageLoading || status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-semibold">Thread</p>
          <Button>
            <XIcon className="size-4 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-full justify-center items-center flex">
          <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-semibold">Thread</p>
          <Button>
            <XIcon className="size-4 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-full flex-col gap-x-2 justify-center items-center flex">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No Message Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-[49px] flex justify-between items-center px-4 border-b">
        <p className="text-lg font-semibold">Thread</p>
        <Button onClick={onClose} size="sm" variant="ghost">
          <XIcon className="size-4 stroke-[1.5]" />
        </Button>
      </div>
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
                  hideThreadButton
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
        <Message
          key={message._id}
          id={message._id}
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          image={message.image}
          body={message.body}
          updatedAt={message.updateAt}
          createdAt={message._creationTime}
          isEditing={editingId === message._id}
          setEditingId={setEditingId}
          hideThreadButton
          isAuthor={member?._id === message.memberId}
          reactions={message.reactions}
        />
      </div>
      <div className="px-2">
        <Editor
          onSubmit={handleSubmit}
          disable={isPending}
          placeholder="Reply..."
          innerRef={editorRef}
          key={prevKey}
        />
      </div>
    </div>
  );
};
