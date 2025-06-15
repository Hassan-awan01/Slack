import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "../../../../convex/_generated/dataModel";
import { ChevronDown, ListFilter, SquarePen } from "lucide-react";
import { Hint } from "@/components/hint-tooltip";
import { useState } from "react";
import { PreferenceModal } from "./preference-model";

interface WorkSpaceHeaderProps {
  workspace: Doc<"workSpaces">;
  isAdmin: boolean;
}
export const WorkSpaceHeader = ({
  workspace,
  isAdmin,
}: WorkSpaceHeaderProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PreferenceModal
        open={open}
        setOpen={setOpen}
        initialValue={workspace.name}
      />
      <div className="items-center justify-between h-[49px] px-4 flex gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="transparent"
              className="font-semibold w-40 overflow-hidden p-1.5 text-lg"
            >
              <span className="truncate whitespace-nowrap overflow-hidden">
                {workspace.name}
              </span>
              <ChevronDown className="size-4 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="start" className="w-64">
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div className="relative overflow-hidden size-9 flex items-center justify-center bg-[#616061] text-white font-semibold text-xl rounded-md mr-2">
                {workspace?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  Active Workspace
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {}}
                  className="cursor-pointer capitalize"
                >
                  <p>Invite People to the Workspace</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setOpen(true)}
                  className="cursor-pointer capitalize"
                >
                  <p>Preferences</p>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="items-center gap-0.5 flex">
          <Hint label="new Message" side="bottom">
            <Button variant="transparent" size="icon">
              <SquarePen className="size-4" />
            </Button>
          </Hint>
          <Hint label="Filter Workspace" side="bottom">
            <Button variant="transparent" size="icon">
              <ListFilter className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
};
