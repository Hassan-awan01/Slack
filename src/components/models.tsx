"use client";

import { CreateWorkspaceModel } from "@/features/workspace/components/create-worksoace-model";
import { useEffect, useState } from "react";
import { CreateChannelModel } from "@/features/channels/components/create-Channel-model";

export const Models = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, [setMounted]);
  if (!mounted) return null;
  return (
    <>
      <CreateChannelModel />
      <CreateWorkspaceModel />
    </>
  );
};
