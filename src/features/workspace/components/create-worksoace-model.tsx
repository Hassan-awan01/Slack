"use client";

import {
  Dialog,
  DialogContent,
  //   DialogDescription,
  DialogHeader,
  DialogTitle,
  //   DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateWorkspaceModel } from "../store/use-create-workspace-model";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace-hook";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const CreateWorkspaceModel = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModel();
  const [name, setName] = useState("");
  const { mutate, isPending } = useCreateWorkspace();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      {
        name,
      },
      {
        onSuccess(id) {
          toast.success("WorkSpace Created");
          router.push(`/workspace/${id}`);
          handelChange();
        },
      }
    );
  };

  const handelChange = () => {
    setOpen(false);
    setName("");
  };
  return (
    <Dialog open={open} onOpenChange={handelChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a WorkSpace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            placeholder="WorkSpace Name e.g. 'Home', 'Personal', 'Team'"
          />
        </form>
        <div className="flex justify-end">
          <Button>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
