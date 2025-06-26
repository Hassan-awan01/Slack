/* eslint-disable @next/next/no-img-element */
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { DialogTitle } from "./ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Thumbnailprops {
  image: string | null | undefined;
}

export const Thumbnail = ({ image }: Thumbnailprops) => {
  if (!image) return null;
  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative overflow-hidden w-32 h-32 border rounded-lg my-2 cursor-zoom-in">
          <img
            src={image}
            alt="Message Image"
            className="rounded-md object-cover size-full"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-none bg-transparent shadow-none p-0">
        <VisuallyHidden>
          <DialogTitle>Image preview</DialogTitle>
        </VisuallyHidden>
        <img
          src={image}
          alt="Message Image"
          className="rounded-md object-cover size-full"
        />
      </DialogContent>
    </Dialog>
  );
};
