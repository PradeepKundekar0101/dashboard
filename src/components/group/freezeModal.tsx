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
import { Textarea } from "../ui/textarea";
import { Label } from "@radix-ui/react-label";

const FreezeModal = ({
  accountId,
  onClose,
  groupId,
}: {
  accountId: string;
  onClose: () => void;
  groupId: string;
}) => {
  const [reason, setReason] = useState("");
  const [isFreezing, setIsFreezing] = useState(false);
  const handleFreeze = async () => {
    setIsFreezing(true);
    try {
      await forexApi.post(`/riskmanagement/freeze`, {
        accountId,
        reason,
        groupId,
      });
      onClose();
    } catch (error) {
      console.error("Error freezing account:", error);
    } finally {
      setIsFreezing(false);
    }
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {" "}
            Are you sure you want to freeze this account?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="text-sm text-muted-foreground">
            This action will prevent the account from trading until it is
            unfrozen.
          </p>
          <Label>Reason</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
          />
        </DialogDescription>
        <DialogFooter>
          <Button onClick={handleFreeze} disabled={isFreezing}>
            {isFreezing ? "Freezing..." : "Freeze"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreezeModal;
