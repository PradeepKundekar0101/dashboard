import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api } from "@/hooks/useAxios";
import { Group } from "@/types";

interface DeleteGroupModalProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

const DeleteGroupModal = ({
  groupId,
  groupName,
  isOpen,
  onClose,
  setGroups,
}: DeleteGroupModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/group/${groupId}`);

      // Update the groups state to remove the deleted group
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );

      toast({
        title: "Group deleted",
        description: "The group has been deleted successfully",
      });

      onClose();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the group "{groupName}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteGroupModal;
