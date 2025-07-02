import Quill, { Delta, Op, type QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { Button } from "./ui/button";
import { ImageIcon, Smile, XIcon } from "lucide-react";
import { Hint } from "./hint-tooltip";
import { cn } from "@/lib/utils";
import { EmojiPopover } from "./emoji-popover";
import Image from "next/image";
// import Keyboard from "quill/modules/keyboard";

// Quill.register("modules/keyboard", Keyboard);
type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disable?: boolean;
  innerRef?: RefObject<Quill | null>;
  variant?: "create" | "update";
}

const Editor = ({
  variant = "create",
  onSubmit,
  onCancel,
  disable = false,
  placeholder = "Write Something",
  innerRef,
  defaultValue = [],
}: EditorProps) => {
  const [text, setText] = useState("");
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const disableRef = useRef(disable);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const imageRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    disableRef.current = disable;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const imageAdded = imageRef.current?.files?.[0] || null;
                const isEmpty =
                  !imageAdded &&
                  text.replace("/<(.|\n)*?>/g", "").trim().length == 0;
                if (isEmpty) return;
                submitRef.current?.({
                  body: JSON.stringify(quill.getContents()),
                  image: imageRef.current?.files?.[0] || null,
                });
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n ");
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();
    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());
    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (quillRef) {
        quillRef.current = null;
      }
      if (container) {
        container.innerHTML = "";
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  const isEmpty =
    !image && text.replace("/<(.|\n)*?>/g", "").trim().length == 0;

  const toggleToolBar = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef?.current?.querySelector(".ql-toolbar");
    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  };

  const onSelect = (emoji: any) => {
    const quill = quillRef.current;
    quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);
  };

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setImage(event.target.files![0])}
        ref={imageRef}
        className="hidden"
      />
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-500 focus-within:shadow-sm transition bg-white",
          disable && "opacity-50"
        )}
      >
        <div ref={containerRef} className="h-full ql-custom" />
        {!!image && (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove Image">
                <button
                  onClick={() => {
                    setImage(null);
                    imageRef.current!.value = "";
                  }}
                  className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 items-center justify-center z-[4] border-white text-white border-2 size-6"
                >
                  <XIcon className="size-3.5" />
                </button>
              </Hint>
              <Image
                fill
                src={URL.createObjectURL(image)}
                alt="uploaded"
                className="rounded-xl overflow-hidden border object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 mb-2 z-[5]">
          <Hint label={isToolbarVisible ? "Hide Formating" : "Show Formating"}>
            <Button
              disabled={disable}
              variant="ghost"
              size="sm"
              onClick={toggleToolBar}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover hint="Emogi" onEmojiSelect={onSelect}>
            <Button disabled={disable} variant="ghost" size="sm">
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant === "create" && (
            <Hint label="Image">
              <Button
                disabled={disable}
                variant="ghost"
                size="sm"
                onClick={() => imageRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === "update" && (
            <div className="flex ml-auto gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={disable}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                size="sm"
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
                disabled={disable || isEmpty}
              >
                Save
              </Button>
            </div>
          )}
          {variant === "create" && (
            <Hint label="send">
              <Button
                className={cn(
                  "ml-auto",
                  isEmpty
                    ? "bg-white hover:bg-white text-muted-foreground"
                    : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                )}
                size="sm"
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
                disabled={disable || isEmpty}
              >
                <MdSend className="size-4" />
              </Button>
            </Hint>
          )}
        </div>
      </div>
      {variant === "create" && (
        <p
          className={cn(
            "flex text-[10px] justify-end text-muted-foreground ml-auto p-1 opacity-0 transition",
            !isEmpty && "opacity-100"
          )}
        >
          <strong>Shift+Enter to have New Line</strong>
        </p>
      )}
    </div>
  );
};

export default Editor;
