import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface workSpaceIdInterface {
  workspaceId: Id<"workSpaces">;
}
export const useGetWorkspaceInfoById = ({
  workspaceId,
}: workSpaceIdInterface) => {
  const data = useQuery(api.workspace.getInfoById, { workspaceId });
  const isLoading = data == undefined;
  return { data, isLoading };
};
