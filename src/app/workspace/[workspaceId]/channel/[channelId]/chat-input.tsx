import { useCreateMessage } from "@/features/messages/api/use-create-message-hook";
import { useGetChannelId } from "@/hooks/use-Get-Channel-id";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGenerateUploadUrl } from "@/features/upload/api/use-upload-image-hook";

const Editor = dynamic(() => import("../../../../../components/editor"), {
  ssr: false,
});
interface ChatInputProp {
  placeholder: string;
}

type CreateMessageValues = {
  body: string;
  workspaceId: Id<"workSpaces">;
  channelId?: Id<"channels">;
  image: Id<"_storage"> | undefined;
};
export const ChatInput = ({ placeholder }: ChatInputProp) => {
  const [prevKey, setPreviousKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const editorRef = useRef<Quill | null>(null);
  const workspaceId = useGetWorkspaceId();
  const channelId = useGetChannelId();
  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef.current?.enable(false);
      const values: CreateMessageValues = {
        workspaceId,
        channelId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });
        const result = await fetch(url!, {
          method: "POST",
          headers: { "Content-Type": image!.type },
          body: image,
        });

        if (!result.ok) throw new Error("Failed to upload Image");

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, {
        throwError: true,
      });
      setPreviousKey((prevKey) => prevKey + 1);
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };
  return (
    <div className="w-full px-5">
      <Editor
        key={prevKey}
        variant="create"
        onSubmit={handleSubmit}
        disable={isPending}
        innerRef={editorRef}
        placeholder={`Message ${placeholder}`}
      />
    </div>
  );
};
