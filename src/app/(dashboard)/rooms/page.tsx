"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Home, Plus, Trash2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import Link from "next/link";

interface RoomRow {
  id: string;
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  occupantCount: number;
  monthlyRent: number;
  roomFacilities: string[];
}

export default function RoomsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [showOccupantsModal, setShowOccupantsModal] = useState<RoomRow | null>(null);

  const { data: rooms = [], isLoading } = useQuery<RoomRow[]>({
    queryKey: ["rooms"],
    queryFn: api.getRooms,
  });

  const deleteRoomMutation = useMutation({
    mutationFn: api.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const handleDeleteRoom = (id: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      deleteRoomMutation.mutate(id);
    }
  };

  const canManage = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "warden";

  const columns: Column<RoomRow>[] = [
    {
      header: "Room Number",
      accessor: (row) => (
        <Link href={`/rooms/${row.id}`} className="font-mono font-bold text-[#2563EB] hover:underline">
          {row.roomNumber}
        </Link>
      ),
    },
    { header: "Building Block", accessor: "building" },
    { header: "Floor Level", accessor: (row) => `Floor ${row.floor}`, className: "font-mono text-slate-500" },
    {
      header: "Rent Fee",
      accessor: (row) => (
        <span className="font-semibold text-slate-800 font-mono">
          Rs. {row.monthlyRent}
        </span>
      ),
    },
    {
      header: "Occupancy Rate",
      accessor: (row) => {
        const isFull = row.occupantCount >= row.capacity;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold text-xs ${
            isFull
              ? "bg-red-50 text-red-700"
              : row.occupantCount > 0
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
          }`}>
            {row.occupantCount} / {row.capacity} Occupied
          </span>
        );
      },
    },
    {
      header: "Facilities",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roomFacilities.map((fac, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium"
            >
              {fac}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Occupants",
      accessor: (row) => (
        <button
          onClick={() => setShowOccupantsModal(row)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-[#e1e2ed] rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Users size={13} />
          {row.occupantCount} Occupant{row.occupantCount !== 1 ? "s" : ""}
        </button>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        canManage ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/rooms/${row.id}`}
              className="text-xs font-bold text-[#2563EB] hover:text-[#1d4ed8] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Users size={13} />
              Manage
            </Link>
            <button
              onClick={() => handleDeleteRoom(row.id)}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Dorms & Rooms Management
            <Home size={22} className="text-[#2563EB]" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor room occupancy counts, monthly rental fees, and facility assignments.
          </p>
        </div>

        {canManage && (
          <Link
            href="/rooms/new"
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Add Room
          </Link>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : (
        <DataTable<RoomRow>
          data={rooms}
          columns={columns}
          searchPlaceholder="Search rooms by number or building..."
          searchField="roomNumber"
        />
      )}

      <AnimatePresence>
        {showOccupantsModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border border-[#c3c6d7] shadow-xl rounded-xl p-6 relative font-sans"
            >
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-[#2563EB]" />
                Occupants &mdash; {showOccupantsModal.roomNumber}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Room {showOccupantsModal.roomNumber}, {showOccupantsModal.building}
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-[#e1e2ed]">
                  <span className="text-sm font-semibold text-slate-600">Current Occupants</span>
                  <span className="text-2xl font-bold text-[#2563EB]">{showOccupantsModal.occupantCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-[#e1e2ed]">
                  <span className="text-sm font-semibold text-slate-600">Total Capacity</span>
                  <span className="text-2xl font-bold text-slate-700">{showOccupantsModal.capacity}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-[#e1e2ed]">
                  <span className="text-sm font-semibold text-slate-600">Available Beds</span>
                  <span className={`text-2xl font-bold ${
                    showOccupantsModal.capacity - showOccupantsModal.occupantCount > 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}>
                    {showOccupantsModal.capacity - showOccupantsModal.occupantCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-[#e1e2ed] mt-4">
                <button
                  type="button"
                  onClick={() => setShowOccupantsModal(null)}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
