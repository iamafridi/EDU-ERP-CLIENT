"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, CheckCircle2, RotateCcw, DollarSign, X, Search, Edit3, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import DataTable from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Column } from "@/components/ui/DataTable";

interface BookFormValues {
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
}



export default function LibraryPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"catalog" | "records">("catalog");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [fineRecord, setFineRecord] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBook, setEditingBook] = useState<any>(null);

  const isLibrarianOrAdmin = roleIs("super-admin", "domain-admin") || user?.staffSubRole === "librarian";

  const { data: books = [] } = useQuery({
    queryKey: ["library-books"],
    queryFn: async () => {
      const raw = await api.getBooks();
      return raw.map((b: any) => ({
        ...b,
        totalCopies: b.quantity ?? b.totalCopies,
        availableCopies: b.available ?? b.availableCopies,
      }));
    },
  });

  const { data: issuedBooks = [] } = useQuery({
    queryKey: ["library-issued"],
    queryFn: async () => {
      const raw = await api.getLibraryRecords();
      return raw.map((r: any) => ({
        ...r,
        studentId: r.studentId ?? "",
        bookId: r.bookId ?? "",
      }));
    },
  });

  const addBookMutation = useMutation({
    mutationFn: (payload: BookFormValues) =>
      api.createBook({
        title: payload.title,
        author: payload.author,
        isbn: payload.isbn,
        quantity: payload.totalCopies,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      setSuccessMsg("New book added to the catalog successfully.");
      setIsBookModalOpen(false);
      resetBookForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const returnBookMutation = useMutation({
    mutationFn: (id: string) => api.returnBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-issued"] });
      setSuccessMsg("Book marked as returned.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateBook(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      setSuccessMsg("Book updated successfully.");
      setIsBookModalOpen(false);
      setEditingBook(null);
      resetBookForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => api.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      setSuccessMsg("Book deleted from catalog.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateLibraryRecordMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateLibraryRecord(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-issued"] });
      setSuccessMsg("Library record updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteLibraryRecordMutation = useMutation({
    mutationFn: (id: string) => api.deleteLibraryRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-issued"] });
      setSuccessMsg("Library record deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const collectFineMutation = useMutation({
    mutationFn: ({ id, fine }: { id: string; fine: number }) =>
      api.payFine(id, { amount: fine }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-issued"] });
      setSuccessMsg(`Fine of $${fineRecord?.fine || 0} collected successfully.`);
      setFineRecord(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const {
    register: registerBook,
    handleSubmit: handleSubmitBook,
    reset: resetBookForm,
    formState: { errors: bookErrors },
  } = useForm<BookFormValues>({
    defaultValues: { title: "", author: "", isbn: "", totalCopies: 1 },
  });

  const openEditBook = (book: any) => {
    setEditingBook(book);
    resetBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: book.totalCopies || book.quantity,
    });
    setIsBookModalOpen(true);
  };

  const onSubmitBook = (data: BookFormValues) => {
    if (editingBook) {
      updateBookMutation.mutate({
        id: editingBook.id,
        payload: {
          title: data.title,
          author: data.author,
          isbn: data.isbn,
          quantity: Number(data.totalCopies) || 1,
        },
      });
    } else {
      addBookMutation.mutate({
        ...data,
        totalCopies: Number(data.totalCopies) || 1,
      });
    }
  };

  const catalogColumns: Column<any>[] = [
    { header: "Title", accessor: "title" },
    { header: "Author", accessor: "author" },
    { header: "ISBN", accessor: "isbn" },
    { header: "Total Copies", accessor: "totalCopies" },
    {
      header: "Available",
      accessor: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.availableCopies > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {row.availableCopies} / {row.totalCopies}
        </span>
      ),
    },
    ...(isLibrarianOrAdmin ? [{
      header: "Actions" as const,
      accessor: (row: any) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditBook(row)}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={() => { if (confirm("Delete this book?")) deleteBookMutation.mutate(row.id); }}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    }] : []),
  ];

  const filteredBooks = books.filter((b: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.isbn.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-[#2563EB]" />
            Library Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage book catalog, issue/return tracking, and fine collection.
          </p>
        </div>

        {isLibrarianOrAdmin && activeTab === "catalog" && (
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Add Book
          </button>
        )}
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

      {/* Tabs */}
      <div className="flex border-b border-[#e1e2ed] gap-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Books Catalog
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "records"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Library Records
        </button>
      </div>

      {/* Books Catalog Tab */}
      {activeTab === "catalog" && (
        <DataTable
          data={filteredBooks}
          columns={catalogColumns}
          searchPlaceholder="Search by title, author, or ISBN..."
          searchField="title"
        />
      )}

      {/* Library Records Tab */}
      {activeTab === "records" && (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              Issued Books / Circulation Records
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-bold">
              {issuedBooks.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Book</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Issue Date</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Due Date</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {issuedBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs text-slate-400">
                      No circulation records found.
                    </td>
                  </tr>
                ) : (
                  issuedBooks.map((record: any) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 text-xs">
                      <td className="p-3">
                        <span className="font-bold text-slate-700 block">{record.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{record.studentId}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{record.bookTitle}</td>
                      <td className="p-3 font-mono text-slate-400">{record.issueDate}</td>
                      <td className="p-3 font-mono text-slate-400">{record.dueDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
                          record.status === "returned"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : record.status === "overdue"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {record.status === "issued" && isLibrarianOrAdmin && (
                            <button
                              onClick={() => returnBookMutation.mutate(record.id)}
                              className="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-emerald-200"
                            >
                              <RotateCcw size={11} /> Return
                            </button>
                          )}
                          {record.status === "overdue" && isLibrarianOrAdmin && (
                            <button
                              onClick={() => setFineRecord(record)}
                              className="h-7 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-amber-200"
                            >
                              <DollarSign size={11} /> Collect Fine
                            </button>
                          )}
                          {isLibrarianOrAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this library record?")) deleteLibraryRecordMutation.mutate(record.id);
                                }}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{editingBook ? "Edit Book" : "Add New Book"}</span>
                <button
                  onClick={() => { setIsBookModalOpen(false); setEditingBook(null); resetBookForm(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitBook(onSubmitBook)} className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Title</label>
                    <input
                      type="text"
                      {...registerBook("title")}
                      placeholder="Book title"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                    {bookErrors.title && (
                      <span className="text-[10px] text-red-500 font-semibold block">{bookErrors.title.message}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Author</label>
                    <input
                      type="text"
                      {...registerBook("author")}
                      placeholder="Author name"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                    {bookErrors.author && (
                      <span className="text-[10px] text-red-500 font-semibold block">{bookErrors.author.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">ISBN</label>
                    <input
                      type="text"
                      {...registerBook("isbn")}
                      placeholder="ISBN number"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                    {bookErrors.isbn && (
                      <span className="text-[10px] text-red-500 font-semibold block">{bookErrors.isbn.message}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Total Copies</label>
                    <input
                      type="number"
                      {...registerBook("totalCopies")}
                      min={1}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                    {bookErrors.totalCopies && (
                      <span className="text-[10px] text-red-500 font-semibold block">{bookErrors.totalCopies.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => { setIsBookModalOpen(false); setEditingBook(null); resetBookForm(); }}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    {editingBook ? "Update Book" : "Add to Catalog"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fine Collection Modal */}
      <AnimatePresence>
        {fineRecord && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Collect Overdue Fine</span>
                <button
                  onClick={() => setFineRecord(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 bg-slate-50 border-b border-[#e1e2ed] space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{fineRecord.bookTitle}</span>
                  <span className="font-mono">{fineRecord.studentName}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Due: {fineRecord.dueDate} — Overdue by{" "}
                  {Math.max(0, Math.floor((Date.now() - new Date(fineRecord.dueDate).getTime()) / (1000 * 60 * 60 * 24)))} days
                </p>
                <div className="text-lg font-mono font-bold text-amber-600">
                  ${Math.max(0, Math.floor((Date.now() - new Date(fineRecord.dueDate).getTime()) / (1000 * 60 * 60 * 24)) * 2)}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fine = Math.max(0, Math.floor((Date.now() - new Date(fineRecord.dueDate).getTime()) / (1000 * 60 * 60 * 24)) * 2);
                  collectFineMutation.mutate({ id: fineRecord.id, fine });
                }}
                className="p-6 space-y-4"
              >
                <p className="text-xs text-slate-400">
                  Fine is calculated at $2 per day past the due date. Collect payment and mark as returned.
                </p>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setFineRecord(null)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <DollarSign size={14} />
                    Collect & Return
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
