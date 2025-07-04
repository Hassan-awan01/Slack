import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface workSpaceIdInterface {
  workspaceId: Id<"workSpaces">;
}
export const useGetWorkspaceDataById = ({
  workspaceId,
}: workSpaceIdInterface) => {
  const data = useQuery(api.workspace.getById, { workspaceId });
  const isLoading = data == undefined;
  return { data, isLoading };
};
