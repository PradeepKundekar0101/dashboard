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

interface RemoveParticipantModalProps {
  groupParticipantId: string;
  onClose: () => void;
  groupId: string;
  userName?: string;
}

const RemoveParticipantModal = ({
  groupParticipantId,
  onClose,
  groupId,
  userName,
}: RemoveParticipantModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    try {
      setLoading(true);
      await api.delete(`/group/${groupId}/participants/${groupParticipantId}`);
      toast({
        title: "Participant removed",
        description: "The participant has been removed from the group",
      });
      onClose();
    } catch (error) {
      console.error("Error removing participant:", error);
      toast({
        title: "Error",
        description: "Failed to remove participant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Participant</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {userName || "this participant"}{" "}
            from the group? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveParticipantModal;
