import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useRemoveWorkspace } from "@/features/workspace/api/use-remove-workspace-hook";
import { useUpdateWorkspace } from "@/features/workspace/api/use-update-workspace-hook";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface PreferenceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}
export const PreferenceModal = ({
  open,
  setOpen,
  initialValue,
}: PreferenceModalProps) => {
  const workspaceId = useGetWorkspaceId();
  const [value, setValue] = useState(initialValue);
  const { mutate: Update, isPending: isUpdatePending } = useUpdateWorkspace();
  const { mutate: Remove, isPending: isRomovePending } = useRemoveWorkspace();
  const [editOpen, setEditOpen] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm(
    "Are You Sure",
    "This is Irreversible"
  );
  const router = useRouter();
  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;
    Remove(
      {
        id: workspaceId,
      },
      {
        onSuccess: () => {
          router.replace("/");
          toast.success("Deleted Successfully");
        },
        onError: () => {
          toast.error("Error in Removing");
        },
      }
    );
  };
  const handleEdit = () => {
    Update(
      {
        id: workspaceId,
        name: value,
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("updated successful");
        },
        onError: () => {
          toast.error("Failed to Update");
        },
      }
    );
  };
  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{initialValue}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">workspace name</p>
                    <p className="text-sm hover:underline font-semibold text-[#1264a3]">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm">{initialValue}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEdit();
                  }}
                >
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    disabled={isUpdatePending}
                    placeholder="WorkSpace Name e.g. 'Home', 'Personal', 'Team'"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isUpdatePending}>
                        cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatePending}>save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={false}
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              className="px-5 py-4 rounded-lg flex items-center gap-x-2 bg-white border cursor-pointer hover:bg-gray-50 text-red-500"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delete Workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
