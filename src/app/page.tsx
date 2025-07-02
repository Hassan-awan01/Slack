"use client";

import { useCurrentUser } from "@/features/auth/api/use-user-hook";
import { UserButton } from "@/features/components/user-button";
import { useWorkspace } from "@/features/workspace/api/use-workspace-hook";
import { useCreateWorkspaceModel } from "@/features/workspace/store/use-create-workspace-model";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const { data, isLoading } = useWorkspace();
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useCreateWorkspaceModel();
  const workspaceId = useMemo(() => data?.[0]?._id, [data]);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (workspaceId) router.replace(`workspace/${workspaceId}`);
    else if (!open && user) setOpen(true);
  }, [isLoading, workspaceId, open, setOpen, router, user]);
  return null;
  // <div>
  //   <UserButton />
  // </div>
}
