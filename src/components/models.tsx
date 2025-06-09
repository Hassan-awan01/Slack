"use client";

import { CreateWorkspaceModel } from "@/features/workspace/components/create-worksoace-model";
import { useEffect, useState } from "react";

export const Models = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, [setMounted]);
  if (!mounted) return null;
  return <CreateWorkspaceModel />;
};
