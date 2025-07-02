import { useMemberProfileId } from "@/features/members/store/use-Member-profile-id";
import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const [memberProfileId, setMemberProfileId] = useMemberProfileId();

  const onOpenMessage = (messageId: string) => {
    setParentMessageId(messageId);
    setMemberProfileId(null);
  };
  const onOpenProfile = (memberId: string) => {
    setMemberProfileId(memberId);
    setParentMessageId(null);
  };

  const onClose = () => {
    setParentMessageId(null);
    setMemberProfileId(null);
  };

  return {
    parentMessageId,
    memberProfileId,
    onOpenProfile,
    onOpenMessage,
    onClose,
  };
};
