import React, { useEffect, useState } from "react";
import { Sheet, SheetTitle, SheetHeader, SheetContent } from "../ui/sheet";
import { Mentor } from "@/types";
import { api } from "@/hooks/useAxios";
import { Button } from "../ui/button";
import { CreateMentor } from "./createMentor";
import { Card, CardTitle, CardHeader, CardDescription } from "../ui/card";
import moment from "moment";
const MentorsDrawer = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isCreateMentorModalOpen, setIsCreateMentorModalOpen] = useState(false);
  useEffect(() => {
    const fetchMentors = async () => {
      const mentors = await api.get("/forexMentor/getMentors");
      console.log(mentors);
      setMentors(mentors.data);
    };
    fetchMentors();
  }, []);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="flex justify-between">
          <SheetTitle>Mentors</SheetTitle>
          <Button onClick={() => setIsCreateMentorModalOpen(true)}>
            Create Mentor
          </Button>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-2">
          {mentors.map((mentor) => (
            <Card key={mentor._id}>
              <CardHeader>
                <CardTitle>
                  {mentor.firstname + " " + mentor.lastname}
                </CardTitle>
                <CardDescription>Email: {mentor.email}</CardDescription>
                <CardDescription>Phone: {mentor.phonenumber}</CardDescription>
                <CardDescription>
                  <h1 className="text-sm text-muted-foreground">
                    Created at:
                    {moment(mentor.createdAt).format("DD/MM/YYYY")}
                  </h1>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <CreateMentor
          isOpen={isCreateMentorModalOpen}
          setIsOpen={setIsCreateMentorModalOpen}
        />
      </SheetContent>
    </Sheet>
  );
};

export default MentorsDrawer;
