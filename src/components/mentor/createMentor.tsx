"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/hooks/useAxios";

const initialFormData = {
  id: "",
  firstname: "",
  lastname: "",
  phonenumber: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const CreateMentor = ({
  isOpen,
  setIsOpen,
  onSuccess,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess?: () => void;
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.post("/forexMentor/createMentor", formData);
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Mentor created successfully",
        });
        resetForm();
        setIsOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create mentor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setIsOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Mentor</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="First Name"
              value={formData.firstname}
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              required
            />

            <Input
              type="text"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              required
            />
            <Input
              type="text"
              placeholder="Phone Number"
              value={formData.phonenumber}
              onChange={(e) =>
                setFormData({ ...formData, phonenumber: e.target.value })
              }
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
