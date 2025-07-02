"use client";

import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

export const useGetMemberId = () => {
  const params = useParams();
  return params.memberId as Id<"members">;
};
