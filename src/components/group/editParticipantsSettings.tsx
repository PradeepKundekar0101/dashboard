import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "@/hooks/useAxios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "@/hooks/use-toast";

// Duration options in milliseconds with their human-readable labels
const durationOptions = [
  { value: 900000, label: "15 mins" }, // 15 minutes
  { value: 1800000, label: "30 mins" }, // 30 minutes
  { value: 2700000, label: "45 mins" }, // 45 minutes
  { value: 3600000, label: "1 hour" }, // 1 hour
  { value: 7200000, label: "2 hours" }, // 2 hours
  { value: 10800000, label: "3 hours" }, // 3 hours
  { value: 14400000, label: "4 hours" }, // 4 hours
  { value: 18000000, label: "5 hours" }, // 5 hours
  { value: 21600000, label: "6 hours" }, // 6 hours
  { value: 25200000, label: "7 hours" }, // 7 hours
];

const EditParticipantsSettings = ({
  onClose,
  show,
  groupParticipantId,
  groupId,
  userId,
}: {
  onClose: () => void;
  groupParticipantId: string;
  groupId: string;
  userId: string;
  show: boolean;
}) => {
  const [freezeThreshold, setFreezeThreshold] = useState<number>(0);
  const [freezeDuration, setFreezeDuration] = useState<number>(0);
  const handleUpdateSettings = async () => {
    try {
      const response = await api.put(
        `/group/updateParticipant/${groupParticipantId}`,
        {
          freezeThreshold,
          freezeDuration,
        }
      );
      if (response.status === 200) {
        toast({
          title: "Settings updated successfully",
        });
        onClose();
      } else {
        toast({
          title: "Failed to update settings",
        });
        onClose();
      }
      console.log(response);
    } catch (error) {
      toast({
        title: "Failed to update settings",
      });
      onClose();
    }
  };
  useEffect(() => {
    console.log("UserId", userId);
    const fetchSettings = async () => {
      try {
        const response = await api.get(
          `/group/getParticipants/participants/${userId}`
        );
        console.log(response);
        const data = response.data[0];
        setFreezeThreshold(
          data.freezeThreshold || data.groupId.freezeThreshold
        );
        setFreezeDuration(data.freezeDuration || data.groupId.freezeDuration);
      } catch (error) {
        toast({
          title: "Failed to fetch settings",
        });
        onClose();
      }
    };
    fetchSettings();
  }, [groupParticipantId]);

  // Find human-readable label for the current duration value
  const getDurationLabel = (value: number) => {
    const option = durationOptions.find((opt) => opt.value === value);
    return option ? option.value.toString() : value.toString();
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Edit Participants Settings</DialogHeader>
        <DialogDescription>
          <div className="flex flex-col gap-2">
            <label htmlFor="freezeThreshold">Freeze Threshold</label>
            <Input
              type="number"
              id="freezeThreshold"
              value={freezeThreshold}
              onChange={(e) => setFreezeThreshold(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="freezeDuration">Freeze Duration</label>
            <Select
              value={freezeDuration.toString()}
              onValueChange={(value) => setFreezeDuration(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            onClick={() => {
              handleUpdateSettings();
            }}
          >
            Save
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditParticipantsSettings;
