import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef } from "react";

const Editor = dynamic(() => import("../../../../../components/editor"), {
  ssr: false,
});
interface ChatInputProp {
  placeholder: string;
}
export const ChatInput = ({ placeholder }: ChatInputProp) => {
  const editorRef = useRef<Quill | null>(null);
  const handleSubmit = ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    console.log({ body, image });
  };
  return (
    <div className="w-full px-5">
      <Editor
        variant="create"
        onSubmit={handleSubmit}
        disable={false}
        innerRef={editorRef}
        placeholder={`Message ${placeholder}`}
      />
    </div>
  );
};
