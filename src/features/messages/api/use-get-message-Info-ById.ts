import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetMessageByIdProps {
  messageId: Id<"messages">;
}
export const useGetMessageById = ({ messageId }: useGetMessageByIdProps) => {
  const data = useQuery(api.messages.getById, { messageId });
  const isLoading = data == undefined;
  return { data, isLoading };
};
