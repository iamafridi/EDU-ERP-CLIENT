"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Layers,
  Search,
  Maximize2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  GraduationCap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SCREENSHOTS, ScreenshotItem } from "@/components/dashboard/ShowcaseModal";

const CATEGORIES = ["All", "Academics", "Faculty & Research", "Students", "Finance", "Campus Life", "Governance"] as const;

export default function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState<ScreenshotItem | null>(null);

  const filtered = SCREENSHOTS.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleNext = () => {
    if (!activeItem) return;
    const currIdx = filtered.findIndex((i) => i.id === activeItem.id);
    const nextIdx = (currIdx + 1) % filtered.length;
    setActiveItem(filtered[nextIdx]);
  };

  const handlePrev = () => {
    if (!activeItem) return;
    const currIdx = filtered.findIndex((i) => i.id === activeItem.id);
    const prevIdx = (currIdx - 1 + filtered.length) % filtered.length;
    setActiveItem(filtered[prevIdx]);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <PageHeader
        title="University System Visual Showcase"
        subtitle="Visual architectural gallery of all 29 operational subsystems across university academics, faculty governance, finance, and campus life."
        badge={
          <Badge variant="gold" size="sm">
            29 Production Screens
          </Badge>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Verified Modules</span>
          <div className="mt-1 text-2xl font-bold font-mono text-gold">{SCREENSHOTS.length} Subsystems</div>
          <span className="text-[11px] text-text-muted">100% route verified</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Academic Suites</span>
          <div className="mt-1 text-2xl font-bold font-mono text-text">8 Modules</div>
          <span className="text-[11px] text-text-muted">OBE, Transcripts, Timetable</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Finance & Ledger</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-600">6 Engines</div>
          <span className="text-[11px] text-text-muted">General Ledger, Fees, Payroll</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Campus IoT & Life</span>
          <div className="mt-1 text-2xl font-bold font-mono text-primary">15 Operations</div>
          <span className="text-[11px] text-text-muted">RFID, Dorms, Governance</span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card noPadding>
        <div className="p-4 border-b border-border bg-surface-elevated/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-surface-navy text-gold shadow-sm"
                    : "text-text-muted hover:text-text hover:bg-surface-elevated"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder="Search screen titles & capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-border bg-surface text-text placeholder:text-text-subtle focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-5 sm:p-6 bg-surface-muted/10">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Layers size={44} className="text-text-subtle mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-text">No Matching Screens</h3>
              <p className="text-xs text-text-muted mt-1">Try resetting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/50 transition-all flex flex-col"
                >
                  {/* Thumbnail Image */}
                  <div
                    onClick={() => setActiveItem(item)}
                    className="relative h-48 w-full bg-surface-muted overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.imagePath}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Maximize2 size={13} /> Click to Inspect
                      </span>
                      <Badge variant="gold" size="sm">
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-text group-hover:text-gold transition-colors truncate">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-surface-muted text-text-muted font-medium"
                        >
                          • {feat}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => setActiveItem(item)}
                        className="text-xs font-semibold text-gold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Inspect Preview
                      </button>
                      <Link
                        href={item.route}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text px-2.5 py-1 rounded-lg hover:bg-surface-muted transition-colors"
                      >
                        <span>Open Screen</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg">
          <div className="relative max-w-5xl w-full flex flex-col max-h-[95vh] bg-surface rounded-2xl border border-gold/30 shadow-2xl overflow-hidden">
            {/* Lightbox Header */}
            <div className="p-4 bg-surface-navy text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <Badge variant="gold" size="sm">
                  {activeItem.category}
                </Badge>
                <div>
                  <h3 className="text-base font-bold text-white">{activeItem.title}</h3>
                  <p className="text-xs text-white/70">{activeItem.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={activeItem.route}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-surface-navy font-bold text-xs hover:bg-gold/90 transition-colors"
                >
                  <span>Launch Live Page</span>
                  <ExternalLink size={13} />
                </Link>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Image Preview */}
            <div className="relative flex-1 bg-surface-navy/95 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
              <img
                src={activeItem.imagePath}
                alt={activeItem.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg border border-white/10 shadow-2xl"
              />

              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-surface/80 hover:bg-surface text-text shadow-xl border border-border transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-surface/80 hover:bg-surface text-text shadow-xl border border-border transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Lightbox Footer */}
            <div className="p-3.5 bg-surface border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-text">Key Features:</span>
                {activeItem.features.map((f, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">
                    {f}
                  </Badge>
                ))}
              </div>
              <span className="text-text-muted font-mono text-[11px]">
                Source: <code className="text-gold">{activeItem.route}</code>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
