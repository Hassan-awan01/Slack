"use client";

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
import { useConfirm } from "@/hooks/use-confirm";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel-hook";
import { useGetChannelId } from "@/hooks/use-Get-Channel-id";
import { useRouter } from "next/navigation";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel-hook";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);
  const workspaceId = useGetWorkspaceId();
  const { data: member } = useCurrentMember({ workspaceId });
  const channelId = useGetChannelId();
  const router = useRouter();

  const { mutate: update, isPending: updatePending } = useUpdateChannel();
  const { mutate: remove, isPending: removePending } = useRemoveChannel();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are You Sure",
    "This is Irreversible"
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleEdit = () => {
    update(
      { channelId, name: value },
      {
        onSuccess: () => {
          toast.success("Updated successfully");
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to update");
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;

    remove(
      { channelId },
      {
        onSuccess: () => {
          router.replace(`/workspace/${workspaceId}`);
          toast.success("Deleted successfully");
        },
        onError: () => {
          toast.error("Error in removing");
        },
      }
    );
  };

  return (
    <>
      <ConfirmDialog />
      <div className="border-b overflow-hidden h-[49px] px-4 items-center flex bg-white">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-lg font-semibold px-2 overflow-hidden w-auto"
            >
              <span className="truncate"># {title}</span>
              <FaChevronDown className="size-2.5 ml-1" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-white">
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              {member?.role === "admin" ? (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Channel name</p>
                        <p className="text-sm hover:underline font-semibold text-[#1264a3]">
                          Edit
                        </p>
                      </div>
                      <p className="text-sm">{title}</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rename this Channel</DialogTitle>
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
                        onChange={handleChange}
                        required
                        autoFocus
                        minLength={3}
                        maxLength={80}
                        disabled={updatePending}
                        placeholder="WorkSpace Name e.g. 'Home', 'Personal', 'Team'"
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            type="button"
                            disabled={updatePending}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={updatePending}>
                          Save
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="px-5 py-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Channel name</p>
                  </div>
                  <p className="text-sm">{title}</p>
                </div>
              )}

              {member?.role === "admin" && (
                <button
                  disabled={removePending}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove();
                  }}
                  className="px-5 py-4 rounded-lg flex items-center gap-x-2 bg-white border cursor-pointer hover:bg-gray-50 text-red-500"
                >
                  <TrashIcon className="size-4" />
                  <p className="text-sm font-semibold">Delete Channel</p>
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
