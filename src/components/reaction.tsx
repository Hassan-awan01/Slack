import { cn } from "@/lib/utils";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { Hint } from "./hint-tooltip";
import { MdOutlineAddReaction } from "react-icons/md";
import { EmojiPopover } from "./emoji-popover";

interface ReactionsProp {
  data: Array<
    Omit<
      Doc<"reactions">,
      "memberId" & {
        count: number;
        memberIds: Id<"messages">[];
      }
    >
  >;
  onChange: (value: string) => void;
}

export const Reactions = ({ data, onChange }: ReactionsProp) => {
  const workspaceId = useGetWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  if (data.length === 0 || !currentMember) {
    return null;
  }
  return (
    <div className="gap-1 mt-1 mb-1 items-center flex">
      {data.map((reaction) => {
        const isReacted = reaction.memberIds.includes(currentMember?._id);
        return (
          <Hint
            key={reaction._id}
            label={`${reaction.count} ${reaction.count === 1 ? "person" : "people"} reacted with ${reaction.value}`}
          >
            <button
              onClick={() => onChange(reaction.value)}
              className={cn(
                "h-6 px-2 border items-center flex rounded-full text-slate-800 transition-all duration-200",
                isReacted
                  ? "bg-blue-100/70 border-blue-500 text-blue-600"
                  : "border-slate-300 hover:bg-slate-100 bg-slate-200"
              )}
            >
              {reaction.value}
              <span
                className={cn(
                  "ml-1 text-xs font-semibold",
                  isReacted ? "text-blue-500" : "text-slate-500"
                )}
              >
                {reaction.count}
              </span>
            </button>
          </Hint>
        );
      })}
      <EmojiPopover
        hint="Add reation"
        onEmojiSelect={(emoji) => onChange(emoji.native)}
      >
        <button className="h-7 px-3 rounded-full bg-slate-200/70 border border-transparent hover:border-slate-500 text-slate-800 flex items-center gap-x-1">
          <MdOutlineAddReaction className="size-4" />
        </button>
      </EmojiPopover>
    </div>
  );
};
