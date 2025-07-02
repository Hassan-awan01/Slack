import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronRight } from "lucide-react";

interface ThreadBarProps {
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  threadName?: string;
  onClick: () => void;
}

export const ThreadBar = ({
  threadCount,
  threadImage,
  threadTimestamp,
  threadName,
  onClick,
}: ThreadBarProps) => {
  if (!threadCount || !threadTimestamp) return null;
  const avatarFallback = threadName?.charAt(0).toUpperCase();
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md border border-transparent hover:bg-white hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={threadImage} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate text-xs text-sky-200 hover:underline font-bold">
          {threadCount} {threadCount > 1 ? "replies" : "reply"}
        </span>
        <span className="truncate text-xs text-muted-foreground group-hover/thread-bar:hidden block">
          Last Reply{" "}
          {formatDistanceToNow(threadTimestamp!, { addSuffix: true })}
        </span>
        <span className="truncate text-xs text-muted-foreground group-hover/thread-bar:block hidden">
          View thread
        </span>
        <ChevronRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0" />
      </div>
    </button>
  );
};
