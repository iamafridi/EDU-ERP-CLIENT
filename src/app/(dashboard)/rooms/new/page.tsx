"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Home, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Select,
  Button,
} from "@/components/ui";

const roomSchema = zod.object({
  roomNumber: zod.string().min(1, "Room number is required"),
  type: zod.string().min(1, "Type is required"),
  capacity: zod.string().min(1, "Capacity must be at least 1"),
  floor: zod.string().min(1, "Floor is required"),
  block: zod.string().min(1, "Block is required"),
  gender: zod.enum(["Male", "Female", "Co-Ed"]),
  monthlyRent: zod.string().optional(),
});

type RoomFormValues = zod.infer<typeof roomSchema>;

export default function NewRoomPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const canManage = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "warden";

  if (!canManage) {
    router.push("/rooms");
    return null;
  }

  const createRoomMutation = useMutation({
    mutationFn: (payload: RoomFormValues) =>
      api.createRoom({
        roomNumber: payload.roomNumber.toUpperCase(),
        building: payload.block,
        floor: parseInt(payload.floor, 10),
        capacity: parseInt(payload.capacity, 10),
        monthlyRent: payload.monthlyRent ? parseFloat(payload.monthlyRent) : 0,
        roomFacilities: [payload.type],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setSuccessMsg("Room created successfully.");
      setTimeout(() => router.push("/rooms"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: "",
      type: "Standard",
      capacity: "2",
      floor: "1",
      block: "Block A",
      gender: "Co-Ed",
      monthlyRent: "3500",
    },
  });

  const onSubmit = (values: RoomFormValues) => {
    createRoomMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title="Add New Room"
        subtitle="Create a new dormitory room and configure occupancy parameters."
        actions={
          <Link href="/rooms">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Back to List
            </Button>
          </Link>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <Card title="Room Specifications" subtitle="Fill in physical location and capacity details">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Room Number" error={errors.roomNumber?.message} required>
              <Input
                {...register("roomNumber")}
                placeholder="e.g. B-206"
                className="uppercase font-mono"
              />
            </FormField>

            <FormField label="Room Type" error={errors.type?.message} required>
              <Select {...register("type")}>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Capacity (Beds)" error={errors.capacity?.message} required>
              <Input
                type="number"
                min={1}
                max={12}
                {...register("capacity")}
              />
            </FormField>

            <FormField label="Floor Level" error={errors.floor?.message} required>
              <Input
                type="number"
                min={0}
                max={15}
                {...register("floor")}
              />
            </FormField>

            <FormField label="Monthly Rent (BDT ৳)" error={errors.monthlyRent?.message}>
              <Input
                type="number"
                min={0}
                step="50"
                placeholder="3500"
                {...register("monthlyRent")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Building Block" error={errors.block?.message} required>
              <Select {...register("block")}>
                <option value="Block A">Block A (North Wing)</option>
                <option value="Block B">Block B (South Wing)</option>
                <option value="Block C">Block C (Postgraduates)</option>
                <option value="Block D">Block D (Intern Doctors)</option>
              </Select>
            </FormField>

            <FormField label="Dormitory Gender Policy" error={errors.gender?.message} required>
              <Select {...register("gender")}>
                <option value="Male">Male Only</option>
                <option value="Female">Female Only</option>
                <option value="Co-Ed">Co-Ed (Postgraduate)</option>
              </Select>
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border">
            <Link href="/rooms">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={createRoomMutation.isPending}
              leftIcon={<Home size={15} />}
            >
              Save Room
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
