import { Leaderboard } from "@/types";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "../ui/dialog";
import moment from "moment";

const FreezeDetails = ({
  account,
  onClose,
}: {
  account: Leaderboard;
  onClose: () => void;
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Freeze Details</DialogHeader>
        <DialogDescription>
          {account && (
            <div>
              <p>Freeze Details</p>
              <p>Account ID: {account.accountId}</p>
              <p>Freeze Reason: {account.freezeDetails.reason}</p>
              <p>
                Freeze Date: {account.freezeDetails.frozenAt.toLocaleString()}
              </p>
              <p>
                Freeze Duration:{" "}
                {moment(account.freezeDetails.releaseTime).format(
                  "DD/MM/YYYY HH:mm:ss"
                )}
              </p>
            </div>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default FreezeDetails;
