"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Pencil, Trash2, CheckCircle2, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

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

  const { data: rooms = [] } = useQuery<any[]>({
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
      setTimeout(() => setSuccessMsg(""), 4000);
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
        floor: parseInt(values.floor),
        capacity: parseInt(values.capacity),
        monthlyRent: parseFloat(values.monthlyRent),
        roomFacilities: values.facilitiesText?.split(",").map(f => f.trim()).filter(Boolean) || [],
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this room?")) {
      deleteRoomMutation.mutate(room?.id);
    }
  };

  if (!room) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Room not found.</p>
        <Link href="/rooms" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Rooms</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/rooms" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Home className="text-[#2563EB]" />
            Room {room.roomNumber}
          </h1>
        </div>
        {canManage && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <button onClick={() => { setIsEditing(false); reset(); }}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
            )}
            <button onClick={handleDelete}
              className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Room Details</span>
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Room Number</label>
                <input type="text" {...register("roomNumber")}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all uppercase" />
                {errors.roomNumber && <span className="text-[10px] text-red-500 font-semibold block">{errors.roomNumber.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Building Block</label>
                <select {...register("building")}
                  className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                </select>
                {errors.building && <span className="text-[10px] text-red-500 font-semibold block">{errors.building.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Floor Level</label>
                <input type="number" min={1} max={10} {...register("floor")}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {errors.floor && <span className="text-[10px] text-red-500 font-semibold block">{errors.floor.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Capacity (Beds)</label>
                <input type="number" min={1} max={8} {...register("capacity")}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {errors.capacity && <span className="text-[10px] text-red-500 font-semibold block">{errors.capacity.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Rent (Rs.)</label>
                <input type="number" min={0} {...register("monthlyRent")}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {errors.monthlyRent && <span className="text-[10px] text-red-500 font-semibold block">{errors.monthlyRent.message}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Facilities (comma separated)</label>
              <input type="text" {...register("facilitiesText")} placeholder="Wi-Fi, Study Desk"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
            </div>
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updateRoomMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Room
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Room Number</label>
                <p className="text-sm font-mono font-bold text-slate-800">{room.roomNumber}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Building</label>
                <p className="text-sm font-semibold text-slate-800">{room.building}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Floor</label>
                <p className="text-sm font-mono text-slate-600">Floor {room.floor}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Rent</label>
                <p className="text-sm font-mono font-semibold text-slate-800">Rs. {room.monthlyRent}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Occupancy</label>
              <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold text-xs ${
                room.occupantCount >= room.capacity
                  ? "bg-red-50 text-red-700"
                  : room.occupantCount > 0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
              }`}>
                {room.occupantCount} / {room.capacity} Occupied
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Facilities</label>
              <div className="flex flex-wrap gap-1">
                {(room.roomFacilities || []).map((fac: string, idx: number) => (
                  <span key={idx}
                    className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">{fac}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center gap-2">
          <Users size={14} className="text-[#2563EB]" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occupant List</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-[#e1e2ed]">
            <span className="text-sm font-semibold text-slate-600">Students Assigned</span>
            <span className="text-2xl font-bold text-[#2563EB]">{room.occupantCount || 0}</span>
          </div>
          {(room.occupantCount || 0) === 0 && (
            <p className="text-xs text-slate-400 mt-4 text-center">No students currently assigned to this room.</p>
          )}
        </div>
      </div>
    </div>
  );
}
