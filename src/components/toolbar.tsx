import { MessageSquareTextIcon, Pencil, Smile, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Hint } from "./hint-tooltip";
import { EmojiPopover } from "./emoji-popover";

interface ToolbarProps {
  isPending: boolean;
  isAuthor: boolean;
  handleThreadButton: boolean | undefined;
  handleEdit: () => void;
  handleDelete: () => void;
  handleReactions: (value: string) => void;
  handleThread: () => void;
}

export const Toolbar = ({
  isPending,
  isAuthor,
  handleDelete,
  handleEdit,
  handleReactions,
  handleThread,
  handleThreadButton,
}: ToolbarProps) => {
  return (
    <div className="absolute right-5 top-0">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border shadow-sm rounded-md bg-white">
        <EmojiPopover
          hint="Add Reaction"
          onEmojiSelect={(emoji) => handleReactions(emoji.native)}
        >
          <Button variant="ghost" size="sm" disabled={isPending}>
            <Smile className="size-4" />
          </Button>
        </EmojiPopover>
        {!handleThreadButton && (
          <Hint label="Reply in Thread">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleThread}
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <Hint label="Edit Message">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleEdit}
            >
              <Pencil className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <Hint label="Delete Message">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash className="size-4" />
            </Button>
          </Hint>
        )}
      </div>
    </div>
  );
};
