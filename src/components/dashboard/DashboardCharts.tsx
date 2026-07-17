"use client";

import React from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const feeData = [
  { name: "Collected", value: 2800000, color: "#2563EB" },
  { name: "Pending", value: 450000, color: "#F59E0B" },
  { name: "Overdue", value: 120000, color: "#EF4444" },
];

const attendanceData = [
  { month: "Jan", present: 88, absent: 12 },
  { month: "Feb", present: 92, absent: 8 },
  { month: "Mar", present: 85, absent: 15 },
  { month: "Apr", present: 90, absent: 10 },
  { month: "May", present: 78, absent: 22 },
  { month: "Jun", present: 82, absent: 18 },
];

const occupancyData = [
  { type: "Occupied", count: 175, color: "#2563EB" },
  { type: "Vacant", count: 25, color: "#E2E8F0" },
];

const revenueData = [
  { month: "Jan", revenue: 420000 },
  { month: "Feb", revenue: 380000 },
  { month: "Mar", revenue: 510000 },
  { month: "Apr", revenue: 460000 },
  { month: "May", revenue: 540000 },
  { month: "Jun", revenue: 490000 },
];

const departmentData = [
  { name: "MBBS", students: 450 },
  { name: "BSc Nursing", students: 280 },
  { name: "MD", students: 190 },
  { name: "Pharmacy", students: 160 },
  { name: "Lab Tech", students: 110 },
  { name: "Public Health", students: 50 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fee Collection Pie Chart */}
      <div className="bg-white border border-[#e1e2ed] p-4 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Fee Collection Overview
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={feeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              label={({ name, value }) => `${name}: ₹${(value / 100000).toFixed(1)}L`}
            >
              {feeData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Bar Chart */}
      <div className="bg-white border border-[#e1e2ed] p-4 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Monthly Attendance %
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" name="Present %" fill="#2563EB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name="Absent %" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hostel Occupancy */}
      <div className="bg-white border border-[#e1e2ed] p-4 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Hostel Occupancy
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={occupancyData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="count"
              label={({ type, count }) => `${type}: ${count}`}
            >
              {occupancyData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Line Chart */}
      <div className="bg-white border border-[#e1e2ed] p-4 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Monthly Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Department Enrollment Bar */}
      <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm lg:col-span-2">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Enrollment by Department
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={departmentData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
            <Tooltip />
            <Bar dataKey="students" name="Students" fill="#2563EB" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
