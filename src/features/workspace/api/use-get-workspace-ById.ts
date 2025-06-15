import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface workSpaceIdInterface {
  id: Id<"workSpaces">;
}
export const useGetWorkspaceDataById = ({ id }: workSpaceIdInterface) => {
  const data = useQuery(api.workspace.getById, { id });
  const isLoading = data == undefined;
  return { data, isLoading };
};
