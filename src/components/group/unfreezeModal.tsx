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
import { forexApi } from "@/hooks/useAxios";

const UnfreezeModal = ({
  accountId,
  onClose,
  groupId,
}: {
  accountId: string;
  onClose: () => void;
  groupId: string;
}) => {
  const [isUnfreezing, setIsUnfreezing] = useState(false);
  const handleUnfreeze = async () => {
    setIsUnfreezing(true);
    try {
      await forexApi.post(`/riskmanagement/unfreeze`, {
        accountId,
        groupId,
      });
      onClose();
    } catch (error) {
      console.error("Error unfreezing account:", error);
    } finally {
      setIsUnfreezing(false);
    }
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {" "}
            Are you sure you want to unfreeze this account?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="text-sm text-muted-foreground">
            This action will allow the account to trade again.
          </p>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={handleUnfreeze} disabled={isUnfreezing}>
            {isUnfreezing ? "Unfreezing..." : "Unfreeze"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnfreezeModal;
