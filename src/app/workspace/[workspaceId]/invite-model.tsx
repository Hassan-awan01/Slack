import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  //   DialogFooter,
  DialogHeader,
  DialogTitle,
  //   DialogTrigger,
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/workspace/api/use-new-joincode-hook";
import { useConfirm } from "@/hooks/use-confirm";
// import { Input } from "@/components/ui/input";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { DialogDescription } from "@radix-ui/react-dialog";
import { CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface InviteModelProps {
  open: boolean;
  onOpen: (value: boolean) => void;
  name: string;
  joinCode: string;
}

export const InviteModel = ({
  open,
  onOpen,
  name,
  joinCode,
}: InviteModelProps) => {
  const workspaceId = useGetWorkspaceId();
  const { mutate: change, isPending: changePending } = useNewJoinCode();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are You Sure",
    "Nobody will be able to join through previous code"
  );
  const handleChange = async () => {
    const ok = await confirm();
    if (!ok) return;
    change(
      {
        workspaceId,
      },
      {
        onSuccess: () => {
          //   onOpen(false);
          toast.success("updated successful");
        },
        onError: () => {
          toast.error("Failed to Update");
        },
      }
    );
  };

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("invite Link Copied to the clipboard"));
  };
  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={onOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite People to {name}</DialogTitle>
            <DialogDescription>
              Use the below code to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-center items-center gap-y-4 py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button onClick={handleCopy} variant="ghost" size="sm">
              Copy code
              <CopyIcon />
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={changePending}
              onClick={handleChange}
              variant="outline"
            >
              New Code
              <RefreshCcw className="size-4 ml-2" />
            </Button>
            <DialogClose asChild>
              <Button disabled={changePending}>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
