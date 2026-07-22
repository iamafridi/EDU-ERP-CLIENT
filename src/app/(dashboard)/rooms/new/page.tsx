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

const roomSchema = zod.object({
  roomNumber: zod.string().min(1, "Room number is required"),
  type: zod.string().min(1, "Type is required"),
  capacity: zod.string().min(1, "Capacity must be at least 1"),
  floor: zod.string().min(1, "Floor is required"),
  block: zod.string().min(1, "Block is required"),
  gender: zod.enum(["Male", "Female", "Co-Ed"]),
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
        roomNumber: payload.roomNumber,
        building: payload.block,
        floor: parseInt(payload.floor),
        capacity: parseInt(payload.capacity),
        monthlyRent: 0,
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
    },
  });

  const onSubmit = (values: RoomFormValues) => {
    createRoomMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/rooms" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Home className="text-[#2563EB]" />
            Add New Room
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new dormitory room.</p>
        </div>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Room Number</label>
              <input type="text" {...register("roomNumber")} placeholder="e.g. B-206"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all uppercase" />
              {errors.roomNumber && <span className="text-[10px] text-red-500 font-semibold block">{errors.roomNumber.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Room Type</label>
              <select {...register("type")}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
              {errors.type && <span className="text-[10px] text-red-500 font-semibold block">{errors.type.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Capacity (Beds)</label>
              <input type="number" min={1} max={8} {...register("capacity")}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              {errors.capacity && <span className="text-[10px] text-red-500 font-semibold block">{errors.capacity.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Floor</label>
              <input type="number" min={0} max={10} {...register("floor")}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              {errors.floor && <span className="text-[10px] text-red-500 font-semibold block">{errors.floor.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Block</label>
              <select {...register("block")}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
              </select>
              {errors.block && <span className="text-[10px] text-red-500 font-semibold block">{errors.block.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Gender</label>
              <select {...register("gender")}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Co-Ed">Co-Ed</option>
              </select>
              {errors.gender && <span className="text-[10px] text-red-500 font-semibold block">{errors.gender.message}</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
            <Link href="/rooms"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={createRoomMutation.isPending}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
              <Home size={14} />
              Save Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
