"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/hooks/useAxios";
import { Mentor } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { CreateMentor } from "@/components/mentor/createMentor";

const Mentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateMentorModalOpen, setIsCreateMentorModalOpen] = useState(false);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/forexMentor/getMentors");
      setMentors(response.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mentors</h1>
        <Button onClick={() => setIsCreateMentorModalOpen(true)}>
          Add Mentor
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : mentors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No mentors found
                </TableCell>
              </TableRow>
            ) : (
              mentors.map((mentor) => (
                <TableRow key={mentor._id}>
                  <TableCell>{mentor.firstname}</TableCell>
                  <TableCell>{mentor.lastname}</TableCell>
                  <TableCell>{mentor.email}</TableCell>
                  <TableCell>{mentor.phonenumber}</TableCell>
                  <TableCell>
                    {moment(mentor.createdAt).format("DD/MM/YYYY")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateMentor
        isOpen={isCreateMentorModalOpen}
        setIsOpen={setIsCreateMentorModalOpen}
        onSuccess={fetchMentors}
      />
    </div>
  );
};

export default Mentors;
