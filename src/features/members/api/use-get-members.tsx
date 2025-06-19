import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetMembersProps {
  workspaceId: Id<"workSpaces">;
}

export const useGetMembers = ({ workspaceId }: useGetMembersProps) => {
  const data = useQuery(api.member.get, { workspaceId });
  const isLoading = data === undefined;
  return { data, isLoading };
};
