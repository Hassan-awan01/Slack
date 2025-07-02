import { useGetMember } from "@/features/members/api/use-get-member";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  ChevronDown,
  Loader,
  MailIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useUpdateMember } from "@/features/members/api/use-update-member-hook";
import { useRemoveMember } from "@/features/members/api/use-remove-member-hook";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspaceId } from "@/hooks/use-Get-workspace-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}
export const Profile = ({ memberId, onClose }: ProfileProps) => {
  const router = useRouter();
  const workspaceId = useGetWorkspaceId();
  const { data: member, isLoading: memberLoading } = useGetMember({ memberId });
  const { data: currentMember, isLoading: currentMemberLoading } =
    useCurrentMember({ workspaceId });
  const { mutate: update } = useUpdateMember();
  const { mutate: remove } = useRemoveMember();

  const [UpdateDialog, updateConfirm] = useConfirm(
    "Update Role",
    "Are you Sure you want to update Role"
  );
  const [LeaveDialog, leaveConfirm] = useConfirm(
    "Leave Workspace",
    "Are you sure you want to leave Workspace"
  );
  const [RemoveDialog, removeConfirm] = useConfirm(
    "Remove Member",
    "Are you sure to want to remove this member"
  );

  const handleRemove = async () => {
    const ok = await removeConfirm();
    if (!ok) return;
    remove(
      {
        memberId: memberId,
      },
      {
        onSuccess: () => {
          toast.success("Removed Successfully");
          onClose();
        },
        onError: () => {
          toast.error("Failed to Remove");
        },
      }
    );
  };

  const handleLeave = async () => {
    const ok = await leaveConfirm();
    if (!ok) return;
    remove(
      {
        memberId: memberId,
      },
      {
        onSuccess: () => {
          toast.success("Removed Successfully");
          router.replace("/");
        },
        onError: () => {
          toast.error("Failed to Remove");
        },
      }
    );
  };

  const handleUpdate = async (role: "admin" | "member") => {
    const ok = await updateConfirm();
    if (!ok) return;
    update(
      {
        memberId: memberId,
        role: role,
      },
      {
        onSuccess: () => {
          toast.success("Updated Successfully");
        },
        onError: () => {
          toast.error("Failed to Update");
        },
      }
    );
  };

  if (memberLoading || currentMemberLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-semibold">Profile</p>
          <Button onClick={onClose}>
            <XIcon className="size-4 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-full justify-center items-center flex">
          <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-semibold">Profile</p>
          <Button onClick={onClose}>
            <XIcon className="size-4 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-full flex-col gap-x-2 justify-center items-center flex">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No Profile Found</p>
        </div>
      </div>
    );
  }
  const avatarFallback = member?.user?.name?.charAt(0).toUpperCase();

  return (
    <>
      <RemoveDialog />
      <UpdateDialog />
      <LeaveDialog />
      <div className="flex flex-col h-full">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-semibold">Profile</p>
          <Button onClick={onClose}>
            <XIcon className="size-4 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex-col justify-center items-center flex p-4">
          <Avatar className="max-w-[256px] max-h-[256px] size-full">
            <AvatarImage src={member.user.image} />
            <AvatarFallback className="aspect-square text-6xl">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-lg font-bold">User Name: {member?.user?.name}</p>
          {currentMember?.role === "admin" &&
            currentMember._id !== memberId && (
              <div className="flex items-center mt-2 gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      // onClick={handleUpdate}
                      variant="outline"
                      className="flex-1 capitalize"
                    >
                      {member?.role} <ChevronDown className="size-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup
                      value={member.role}
                      onValueChange={(role) =>
                        handleUpdate(role as "admin" | "member")
                      }
                    >
                      <DropdownMenuRadioItem value="admin">
                        Admin
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="member">
                        Member
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={handleRemove}
                  variant="outline"
                  className="flex-1"
                >
                  Remove
                </Button>
              </div>
            )}

          {currentMember?.role !== "admin" &&
            currentMember._id === memberId && (
              <div className="flex items-center mt-2 gap-2">
                <Button
                  onClick={handleLeave}
                  variant="outline"
                  className="w-full capitalize"
                >
                  Leave
                </Button>
              </div>
            )}

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center justify-center size-9 bg-muted rounded-md">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] text-muted-foreground font-semibold">
                Email Address
              </p>
              <Link
                href={`mailto:${member?.user?.email}`}
                className="text-sm hover:underline text-[#1264a3]"
              >
                {member?.user?.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
