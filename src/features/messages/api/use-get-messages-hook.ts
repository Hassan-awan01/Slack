import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export type GetMessagesReturnType =
  (typeof api.messages.get._returnType)["page"];

const BATCH_SIZE = 20;

interface useGetMessagesProps {
  channelId?: Id<"channels">;
  conversationId?: Id<"conversations">;
  parentMessageId?: Id<"messages">;
}

export const useGetMessages = ({
  channelId,
  conversationId,
  parentMessageId,
}: useGetMessagesProps) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.get,
    {
      channelId,
      conversationId,
      parentMessageId,
    },
    {
      initialNumItems: BATCH_SIZE,
    }
  );
  console.log(results);
  return {
    results,
    status,
    loadMore: () => loadMore(BATCH_SIZE),
  };
};
