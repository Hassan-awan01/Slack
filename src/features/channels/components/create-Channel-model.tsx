"use client";

import {
  Dialog,
  DialogContent,
  //   DialogDescription,
  DialogHeader,
  DialogTitle,
  //   DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateChannelModel } from "../store/use-create-channel-model";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateChannel } from "../api/use-create-channel-hook";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";

export const CreateChannelModel = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateChannelModel();
  const [name, setName] = useState("");
  const { mutate, isPending } = useCreateChannel();
  const workspaceId = useGetWorkspaceId();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      {
        name,
        workspaceId,
      },
      {
        onSuccess(id) {
          toast.success("WorkSpace Created");
          router.push(`/workspace/${workspaceId}/channel/${id}`);
          handelClose();
        },
      }
    );
  };

  const handelClose = () => {
    setOpen(false);
    setName("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setName(value);
  };

  return (
    <Dialog open={open} onOpenChange={handelClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Change</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={handleChange}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            placeholder="WorkSpace Name e.g. hello-channel"
          />
        </form>
        <div className="flex justify-end">
          <Button disabled={isPending}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
