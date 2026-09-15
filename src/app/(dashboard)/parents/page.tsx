"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormField, Input } from "@/components/ui/Form";
import { Alert } from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Plus } from "lucide-react";

interface ParentRow {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  occupation: string;
  children: { id: string; name: string }[];
}

const EMPTY_FORM = { name: "", email: "", contactNo: "", occupation: "", childrenText: "" };

function displayName(name: ParentRow["name"]): string {
  if (typeof name === "string") return name;
  const obj = name as { firstName?: string; lastName?: string } | null;
  return `${obj?.firstName ?? ""} ${obj?.lastName ?? ""}`.trim();
}

export default function ParentsPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const isAdminOrRegistrar = roleIs("domain-admin", "super-admin");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: parents = [], isLoading } = useQuery<ParentRow[]>({
    queryKey: ["parents"],
    queryFn: api.getParents,
  });

  const createMutation = useMutation({
    mutationFn: api.createParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      setSuccessMsg("Parent profile created successfully.");
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const children = form.childrenText
      ? form.childrenText.split(",").map((c) => ({ id: `STU-${c.trim().substring(0, 3).toUpperCase()}`, name: c.trim() }))
      : [];
    createMutation.mutate({
      name: form.name,
      email: form.email,
      contactNo: form.contactNo,
      occupation: form.occupation,
      children,
    });
  };

  const columns: Column<ParentRow>[] = [
    {
      header: "Name",
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={displayName(row.name)} size="sm" />
          <span className="font-medium text-text">{displayName(row.name)}</span>
        </div>
      ),
      sortValue: (row) => displayName(row.name),
    },
    {
      header: "Contact",
      accessor: (row) => (
        <div className="space-y-0.5">
          <span className="block text-xs text-text-muted">{row.email}</span>
          <span className="block text-xs text-text-subtle font-mono tabular-nums">{row.contactNo}</span>
        </div>
      ),
    },
    {
      header: "Children",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.children.map((child) => (
            <Badge key={child.id} tone="primary">
              {child.name}
            </Badge>
          ))}
        </div>
      ),
      sortable: false,
    },
    { header: "Occupation", accessor: "occupation" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Parents & Guardians"
        description="Parent and guardian profiles linked to enrolled students."
        actions={
          isAdminOrRegistrar ? (
            <Button leftIcon={<Plus size={15} aria-hidden="true" />} onClick={() => setShowCreateModal(true)}>
              Create Parent
            </Button>
          ) : undefined
        }
      />

      {successMsg && (
        <Alert tone="success" className="max-w-xl">
          {successMsg}
        </Alert>
      )}

      <DataTable<ParentRow>
        data={parents}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search by parent name..."
        searchField="name"
        tableId="parents"
        emptyTitle="No parent profiles yet"
        emptyDescription="Create parent profiles to link them with enrolled students."
        emptyAction={
          isAdminOrRegistrar ? (
            <Button size="sm" leftIcon={<Plus size={14} aria-hidden="true" />} onClick={() => setShowCreateModal(true)}>
              Create Parent
            </Button>
          ) : undefined
        }
      />

      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Parent Profile"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="parent-form" loading={createMutation.isPending}>
              Create parent
            </Button>
          </>
        }
      >
        <form id="parent-form" onSubmit={handleCreate} className="space-y-4">
          <FormField label="Full Name" htmlFor="parent-name" required>
            <Input
              id="parent-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Robert Chen"
              required
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" htmlFor="parent-email">
              <Input
                id="parent-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="parent@email.com"
              />
            </FormField>
            <FormField label="Contact No" htmlFor="parent-contact">
              <Input
                id="parent-contact"
                value={form.contactNo}
                onChange={(e) => setForm((p) => ({ ...p, contactNo: e.target.value }))}
                placeholder="+1 555-1111"
              />
            </FormField>
          </div>
          <FormField label="Occupation" htmlFor="parent-occupation">
            <Input
              id="parent-occupation"
              value={form.occupation}
              onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
              placeholder="e.g. Software Engineer"
            />
          </FormField>
          <FormField
            label="Children Names"
            htmlFor="parent-children"
            hint="Comma separated, e.g. Marcus Chen, Sophia Martinez"
          >
            <Input
              id="parent-children"
              value={form.childrenText}
              onChange={(e) => setForm((p) => ({ ...p, childrenText: e.target.value }))}
              placeholder="Marcus Chen, Sophia Martinez"
            />
          </FormField>
        </form>
      </Dialog>
    </div>
  );
}
