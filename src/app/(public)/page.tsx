"use client";

import React from "react";
import HeroSection from "@/components/landing/HeroSection";
import TrustStrip from "@/components/landing/TrustStrip";
import ProductTour from "@/components/landing/ProductTour";
import FeatureGrid from "@/components/landing/FeatureGrid";
import ModuleCoverage from "@/components/landing/ModuleCoverage";
import StatisticsStrip from "@/components/landing/StatisticsStrip";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#090A10] text-white selection:bg-[#624FDA] selection:text-white relative overflow-hidden">
      {/* ─── Hero Section with Browser Dashboard Preview ─── */}
      <HeroSection />

      {/* ─── Trust Strip with Muted Institutional Labels (Commented Out) ─── */}
      {/* <TrustStrip /> */}

      {/* ─── Interactive Product Tour Tabs ─── */}
      <ProductTour />

      {/* ─── The Hostel Pro-ERP Difference (3-Column Feature Grid) ─── */}
      <FeatureGrid />

      {/* ─── 82 Modules Coverage Grid ─── */}
      <ModuleCoverage />

      {/* ─── Horizontal Proof Points Strip ─── */}
      <StatisticsStrip />

      {/* ─── Final Centered CTA Panel ─── */}
      <FinalCTA />
    </div>
  );
}
