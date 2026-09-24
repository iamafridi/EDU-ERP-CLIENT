"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  PageHeader,
  Card,
  Button,
  IconButton,
  Badge,
  Modal,
  ActionMenu,
  ProgressBar,
} from "@/components/ui";
import { Home, Plus, Trash2, Users, Eye, Edit3 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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

  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalOccupants = rooms.reduce((sum, r) => sum + (r.occupantCount || 0), 0);
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0;

  const columns: Column<RoomRow>[] = [
    {
      header: "Room Number",
      accessor: (row) => (
        <Link href={`/rooms/${row.id}`} className="font-mono font-bold text-gold hover:underline">
          {row.roomNumber}
        </Link>
      ),
    },
    { header: "Building Block", accessor: "building" },
    { header: "Floor Level", accessor: (row) => `Floor ${row.floor}`, className: "font-mono text-text-muted" },
    {
      header: "Monthly Rent",
      accessor: (row) => (
        <span className="font-semibold text-text font-mono">
          ৳{Number(row.monthlyRent || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Occupancy Rate",
      accessor: (row) => {
        const isFull = row.occupantCount >= row.capacity;
        const pct = row.capacity > 0 ? (row.occupantCount / row.capacity) * 100 : 0;
        return (
          <div className="w-36 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold">{row.occupantCount}/{row.capacity}</span>
              <span className={isFull ? "text-danger font-bold" : "text-text-muted"}>{Math.round(pct)}%</span>
            </div>
            <ProgressBar value={pct} variant={isFull ? "warning" : "success"} size="xs" />
          </div>
        );
      },
    },
    {
      header: "Facilities",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roomFacilities?.length > 0 ? (
            row.roomFacilities.map((fac, idx) => (
              <Badge key={idx} variant="neutral" size="sm">
                {fac}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-text-muted italic">None specified</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2.5"
            onClick={() => setShowOccupantsModal(row)}
          >
            Occupants
          </Button>
          {canManage && (
            <ActionMenu
              items={[
                {
                  label: "Room Details",
                  icon: <Eye size={13} />,
                  onClick: () => router.push(`/rooms/${row.id}`),
                },
                {
                  label: "Delete Room",
                  icon: <Trash2 size={13} />,
                  variant: "danger",
                  onClick: () => handleDeleteRoom(row.id),
                },
              ]}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Dorms & Rooms Management"
        subtitle="Monitor room occupancy counts, monthly rental fees in BDT (৳), and facility assignments."
        actions={
          canManage && (
            <Link href="/rooms/new">
              <Button variant="gold" leftIcon={<Plus size={15} />}>
                Add Room
              </Button>
            </Link>
          )
        }
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Campus Occupancy</span>
            <Badge variant="gold" size="sm">{overallOccupancyRate}% Occupied</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-text">{totalOccupants}</span>
            <span className="text-xs text-text-muted">/ {totalCapacity} Total Beds</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={overallOccupancyRate} variant="gold" size="sm" />
          </div>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Total Rooms</span>
          <div className="mt-2 text-2xl font-bold font-mono text-text">{rooms.length} Units</div>
          <span className="text-xs text-text-muted mt-1 block">Across all medical campus halls</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Available Vacancies</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {Math.max(0, totalCapacity - totalOccupants)} Beds
          </div>
          <span className="text-xs text-text-muted mt-1 block">Ready for student hostel allocation</span>
        </Card>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : (
        <Card noPadding>
          <DataTable<RoomRow>
            data={rooms}
            columns={columns}
            searchPlaceholder="Search rooms by number or building..."
            searchField="roomNumber"
          />
        </Card>
      )}

      {/* Unified Modal Component */}
      <Modal
        isOpen={!!showOccupantsModal}
        onClose={() => setShowOccupantsModal(null)}
        title={`Occupants — Room ${showOccupantsModal?.roomNumber || ""}`}
        subtitle={showOccupantsModal ? `Building: ${showOccupantsModal.building} • Floor Level: ${showOccupantsModal.floor}` : undefined}
        size="md"
        footer={
          <div className="flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setShowOccupantsModal(null)}>
              Close
            </Button>
          </div>
        }
      >
        {showOccupantsModal && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
              <span className="text-sm font-semibold text-text-muted">Current Occupants</span>
              <span className="text-2xl font-bold text-gold">{showOccupantsModal.occupantCount}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
              <span className="text-sm font-semibold text-text-muted">Total Capacity</span>
              <span className="text-2xl font-bold text-text">{showOccupantsModal.capacity}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
              <span className="text-sm font-semibold text-text-muted">Available Beds</span>
              <span
                className={`text-2xl font-bold ${
                  showOccupantsModal.capacity - showOccupantsModal.occupantCount > 0
                    ? "text-emerald-600"
                    : "text-danger"
                }`}
              >
                {Math.max(0, showOccupantsModal.capacity - showOccupantsModal.occupantCount)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
              <span className="text-sm font-semibold text-text-muted">Monthly Rent (BDT)</span>
              <span className="text-lg font-bold font-mono text-gold">
                ৳{Number(showOccupantsModal.monthlyRent || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
