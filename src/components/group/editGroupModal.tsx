import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { api } from "@/hooks/useAxios";
import { toast } from "@/hooks/use-toast";
import { Group } from "@/types";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
const EditGroupModal = ({
  id,
  name,
  description,
  isOpen,
  onClose,
  setGroups,
}: {
  id: string;
  name: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}) => {
  const [groupName, setGroupName] = useState(name);
  const [groupDescription, setGroupDescription] = useState(description);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Update local state when props change
  useEffect(() => {
    setGroupName(name);
    setGroupDescription(description);
  }, [name, description]);

  const fetchGroups = async () => {
    try {
      const decodedToken = jwtDecode(localStorage.getItem("authToken") || "");
      if (!decodedToken) {
        localStorage.clear();
        router.push("/login");
        return;
      }
      if (localStorage.getItem("mentor")) {
        const mentor = JSON.parse(localStorage.getItem("mentor") || "");
        const response = await api.get(`/forexMentor/getGroups/${mentor?._id}`);
        setGroups(response.data);
      } else {
        const response = await api.get("/group");
        setGroups(response.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error fetching groups",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(`/group/${id}`, {
        name: groupName,
        description: groupDescription,
      });

      if (response.status !== 200) {
        throw new Error("Failed to update group");
      }

      // Update the groups state directly to avoid delay in UI update
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === id
            ? { ...group, name: groupName, description: groupDescription }
            : group
        )
      );

      // Also fetch the updated list from server
      await fetchGroups();

      toast({
        title: "Group updated successfully",
      });

      onClose();
    } catch (error) {
      console.error("Error updating group:", error);
      setError("Failed to update group");
      toast({
        title: "Failed to update group",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className="mb-4"
          />
          <Textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="Group Description"
            className="mb-4 h-24"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;
