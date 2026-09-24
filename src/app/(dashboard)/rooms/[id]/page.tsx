"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  Home,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
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
  IconButton,
  Badge,
} from "@/components/ui";

const roomSchema = zod.object({
  roomNumber: zod.string().min(1, "Room number is required"),
  building: zod.string().min(1, "Building is required"),
  floor: zod.string().min(1, "Floor is required"),
  capacity: zod.string().min(1, "Capacity must be at least 1"),
  monthlyRent: zod.string().min(1, "Rent is required"),
  facilitiesText: zod.string().optional(),
});

type RoomFormValues = zod.infer<typeof roomSchema>;

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const canManage = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "warden";

  const { data: rooms = [], isLoading } = useQuery<any[]>({
    queryKey: ["rooms"],
    queryFn: api.getRooms,
  });

  const room = rooms.find((r: any) => r.id === params.id);

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateRoom(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setSuccessMsg("Room updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: api.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.push("/rooms");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
  });

  useEffect(() => {
    if (room) {
      reset({
        roomNumber: room.roomNumber || "",
        building: room.building || "",
        floor: String(room.floor || 0),
        capacity: String(room.capacity || 0),
        monthlyRent: String(room.monthlyRent || 0),
        facilitiesText: (room.roomFacilities || []).join(", "),
      });
    }
  }, [room, reset]);

  const onSubmit = (values: RoomFormValues) => {
    if (!room) return;
    updateRoomMutation.mutate({
      id: room.id,
      payload: {
        roomNumber: values.roomNumber,
        building: values.building,
        floor: parseInt(values.floor, 10),
        capacity: parseInt(values.capacity, 10),
        monthlyRent: parseFloat(values.monthlyRent),
        roomFacilities: values.facilitiesText?.split(",").map((f) => f.trim()).filter(Boolean) || [],
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      deleteRoomMutation.mutate(room?.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-text-muted">
        <p className="text-sm">Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm text-text-muted">Room not found or has been removed.</p>
        <Link href="/rooms">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Rooms
          </Button>
        </Link>
      </div>
    );
  }

  const isFull = (room.occupantCount || 0) >= (room.capacity || 1);

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      <PageHeader
        title={`Room ${room.roomNumber}`}
        subtitle={`Building: ${room.building} • Floor Level: ${room.floor}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/rooms">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Rooms
              </Button>
            </Link>
            {canManage && (
              <>
                {!isEditing ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Pencil size={14} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Room
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 size={14} />}
                  onClick={handleDelete}
                  loading={deleteRoomMutation.isPending}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card
            title={isEditing ? "Edit Room Details" : "Room Specifications"}
            subtitle={isEditing ? "Update configuration and rental fees" : "Dormitory assignment parameters"}
          >
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Room Number" error={errors.roomNumber?.message} required>
                    <Input
                      {...register("roomNumber")}
                      className="uppercase font-mono"
                    />
                  </FormField>
                  <FormField label="Building Block" error={errors.building?.message} required>
                    <Select {...register("building")}>
                      <option value="Block A">Block A</option>
                      <option value="Block B">Block B</option>
                      <option value="Block C">Block C</option>
                      <option value="Block D">Block D</option>
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Floor Level" error={errors.floor?.message} required>
                    <Input type="number" min={0} max={15} {...register("floor")} />
                  </FormField>
                  <FormField label="Capacity (Beds)" error={errors.capacity?.message} required>
                    <Input type="number" min={1} max={12} {...register("capacity")} />
                  </FormField>
                  <FormField label="Rent Fee (BDT ৳)" error={errors.monthlyRent?.message} required>
                    <Input type="number" min={0} {...register("monthlyRent")} />
                  </FormField>
                </div>

                <FormField label="Facilities (Comma-separated)">
                  <Input
                    {...register("facilitiesText")}
                    placeholder="e.g. Wi-Fi, Attached Bathroom, Balcony, Study Desk"
                  />
                </FormField>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={updateRoomMutation.isPending}
                    leftIcon={<Pencil size={14} />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                      Room Number
                    </span>
                    <span className="text-base font-bold font-mono text-text">
                      {room.roomNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                      Building
                    </span>
                    <span className="text-base font-semibold text-text">
                      {room.building}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                      Floor
                    </span>
                    <span className="text-base font-mono text-text">
                      Floor {room.floor}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                      Monthly Rent
                    </span>
                    <span className="text-base font-bold font-mono text-gold">
                      ৳{Number(room.monthlyRent || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Included Facilities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {room.roomFacilities?.length > 0 ? (
                      room.roomFacilities.map((fac: string, idx: number) => (
                        <Badge key={idx} variant="neutral">
                          {fac}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted italic">No facilities assigned</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Occupancy Status" subtitle="Live bed allocation">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
                <span className="text-sm font-medium text-text-muted">Assigned Occupants</span>
                <span className="text-2xl font-bold text-gold font-mono">
                  {room.occupantCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
                <span className="text-sm font-medium text-text-muted">Capacity Limit</span>
                <span className="text-2xl font-bold text-text font-mono">
                  {room.capacity || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
                <span className="text-sm font-medium text-text-muted">Status</span>
                <Badge variant={isFull ? "danger" : (room.occupantCount || 0) > 0 ? "warning" : "success"}>
                  {isFull ? "Full Capacity" : "Vacancies Open"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
