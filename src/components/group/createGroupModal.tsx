"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Group, useGroup } from "@/contexts/GroupContext";
import { toast } from "@/hooks/use-toast";
import { api } from "@/hooks/useAxios";

export const CreateGroupModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [groupName, setGroupName] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");
  const [freezeThreshold, setFreezeThreshold] = useState<number>(0);
  const [freezeDuration, setFreezeDuration] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const { setGroups, groups } = useGroup();
  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(groupName, groupDescription, freezeThreshold, freezeDuration);
    if (!groupName || !groupDescription) {
      toast({
        title: "Error",
        description: "Please fill all the fields",
        variant: "destructive",
      });
      return;
    }
    const group: Group = {
      name: groupName,
      description: groupDescription,
      freezeThreshold,
      freezeDuration,
      startDate: startDate
        ? new Date(`${format(startDate, "yyyy-MM-dd")}T${startTime}`)
        : undefined,
      endDate: endDate
        ? new Date(`${format(endDate, "yyyy-MM-dd")}T${endTime}`)
        : undefined,
    };
    try {
      const response = await api.post("/group", group);
      console.log(response);
      setGroupName("");
      setGroupDescription("");
      setFreezeThreshold(0);
      setFreezeDuration(0);
      setStartDate(undefined);
      setEndDate(undefined);
      setStartTime("");
      setEndTime("");
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      setIsOpen(false);
      setGroups([
        ...groups,
        {
          _id: response.data._id,
          name: response.data.name,
          description: response.data.description,
          freezeThreshold: response.data.freezeThreshold,
          freezeDuration: response.data.freezeDuration,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form onSubmit={handleCreateGroup}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2.5">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  type="text"
                  id="group-name"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="group-description">Group Description</Label>
                <Textarea
                  id="group-description"
                  placeholder="Group Description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="group-description">Freeze Threshold</Label>
                <Input
                  type="number"
                  id="group-description"
                  placeholder="Freeze Threshold"
                  value={freezeThreshold}
                  onChange={(e) => setFreezeThreshold(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="group-description">Freeze Duration</Label>
                <Select
                  value={freezeDuration.toString()}
                  onValueChange={(value) => setFreezeDuration(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="900000">15 mins</SelectItem>
                    <SelectItem value="1800000">30 mins</SelectItem>
                    <SelectItem value="2700000">45 mins</SelectItem>
                    <SelectItem value="3600000">1 hour</SelectItem>
                    <SelectItem value="7200000">2 hours</SelectItem>
                    <SelectItem value="10800000">3 hours</SelectItem>
                    <SelectItem value="24000000">4 hours</SelectItem>
                    <SelectItem value="30000000">5 hours</SelectItem>
                    <SelectItem value="36000000">6 hours</SelectItem>
                    <SelectItem value="42000000">7 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2.5 grid-cols-2">
                <div>
                  <Label>Start Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          `${format(startDate, "PPP")} ${startTime}`
                        ) : (
                          <span>Pick a date & time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="mt-2"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          `${format(endDate, "PPP")} ${endTime}`
                        ) : (
                          <span>Pick a date & time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="mt-2"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
