import { format, isToday, isYesterday } from "date-fns";
import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { Hint } from "./hint-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message-hook";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message-hook";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction-hook";
import { Reactions } from "./reaction";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";
const Renderer = dynamic(() => import("@/components/renderer"), {
  ssr: false,
});

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});
interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isEditing: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  isAuthor: boolean;
  hideThreadButton?: boolean;
  isCompact?: boolean;
  updatedAt: Doc<"messages">["updateAt"];
  createdAt: Doc<"messages">["_creationTime"];
  threadTimestamp?: number;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  image: string | null | undefined;
  body: Doc<"messages">["body"];
  reactions: Array<
    Omit<
      Doc<"reactions">,
      "memberId" & {
        count: number;
        memberIds: Id<"messages">[];
      }
    >
  >;
}

export const Message = ({
  authorName = "Member",
  id,
  authorImage,
  reactions,
  image,
  threadImage,
  threadCount,
  threadTimestamp,
  isAuthor,
  isEditing,
  isCompact,
  setEditingId,
  body,
  createdAt,
  updatedAt,
  hideThreadButton,
  memberId,
  threadName,
}: MessageProps) => {
  const FormatFullDate = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
  };
  const avatarFallback = authorName.charAt(0).toUpperCase();
  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } =
    useToggleReaction();
  const {
    parentMessageId,
    onOpenMessage,
    onClose,
    memberProfileId,
    onOpenProfile,
  } = usePanel();

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { messageId: id, body },
      {
        onSuccess: () => {
          toast.success("message updated successfully");
          setEditingId(null);
        },
        onError: () => {
          toast.error("Failed to Update");
        },
      }
    );
  };

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Message",
    "Are u sre This can not be undone"
  );

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;
    removeMessage(
      { messageId: id },
      {
        onSuccess: () => {
          toast.success("Message Removes successfully");
          if (parentMessageId === id) onClose();
        },
        onError: () => {
          toast.error("Failed to Delete Message");
        },
      }
    );
  };

  const handleReaction = (value: string) => {
    toggleReaction(
      { messageId: id, value: value },
      {
        onError: () => {
          toast.error("Failed to Toggle reaction");
        },
      }
    );
  };

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-300 group relative",
            isEditing && "bg-[#72c74433] hover:bg-[#72c74433]",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-[40px] flex justify-center">
              <Hint label={FormatFullDate(new Date(createdAt))}>
                <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:underline leading-[22px] text-center">
                  {format(new Date(createdAt), "hh:mm")}
                </button>
              </Hint>
            </div>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  variant="update"
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  disable={isUpdatingMessage}
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail image={image} />
                {updatedAt ? (
                  <span className="text-sm text-muted-foreground hover:underline">
                    (edited)
                  </span>
                ) : null}
                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  threadCount={threadCount}
                  threadImage={threadImage}
                  threadTimestamp={threadTimestamp}
                  threadName={threadName}
                  onClick={() => onOpenMessage(id)}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isUpdatingMessage}
              handleEdit={() => setEditingId(id)}
              handleReactions={handleReaction}
              handleDelete={handleRemove}
              handleThread={() => onOpenMessage(id)}
              handleThreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    );
  }
  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-300 group relative",
          isEditing && "bg-[#72c74433] hover:bg-[#72c74433]",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-3">
          <button
            className="w-[40px] flex justify-center"
            onClick={() => onOpenProfile(memberId)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={authorImage} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                variant="update"
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                disable={isUpdatingMessage}
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  className="font-bold text-primary hover:underline"
                  onClick={() => onOpenProfile(memberId)}
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={FormatFullDate(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "hh:mm")}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} />
              <Thumbnail image={image} />
              {updatedAt ? (
                <span className="text-sm text-muted-foreground hover:underline">
                  (edited)
                </span>
              ) : null}
              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                threadCount={threadCount}
                threadImage={threadImage}
                threadTimestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isUpdatingMessage}
            handleEdit={() => setEditingId(id)}
            handleReactions={handleReaction}
            handleDelete={handleRemove}
            handleThread={() => onOpenMessage(id)}
            handleThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  );
};
