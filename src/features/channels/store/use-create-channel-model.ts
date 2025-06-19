import { atom, useAtom } from "jotai";

const modalState = atom(false);

export const useCreateChannelModel = () => {
  return useAtom(modalState);
};
