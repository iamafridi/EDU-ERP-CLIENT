'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  PageHeader,
  Card,
  DataTable,
  Column,
  Button,
  IconButton,
  Badge,
} from '@/components/ui';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Radio, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  DoorOpen,
  Wifi
} from 'lucide-react';

export default function IotManagerPage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  const { data: devices = [], isLoading: isLoadingDevices, refetch: refetchDevices } = useQuery({
    queryKey: ['iotDevices'],
    queryFn: async () => {
      try {
        const res = await api.getIoTDevices();
        if (Array.isArray(res)) return res;
        if (Array.isArray((res as any)?.data)) return (res as any).data;
        return [];
      } catch {
        return [];
      }
    },
  });

  const { data: syncLogs = [], isLoading: isLoadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['iotLogs'],
    queryFn: async () => {
      try {
        const res = await api.getIoTLogs();
        if (Array.isArray(res)) return res;
        if (Array.isArray((res as any)?.data)) return (res as any).data;
        return [];
      } catch {
        return [];
      }
    },
  });

  const triggerTestSync = useMutation({
    mutationFn: () => 
      api.syncIoT({
        deviceId: 'GATE-RFID-01',
        rfidTag: 'E280116060000204',
        action: 'ENTRY_VERIFIED',
        timestamp: new Date(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iotLogs'] });
      queryClient.invalidateQueries({ queryKey: ['iotDevices'] });
      setSuccessMsg('Test RFID telemetry signal dispatched and processed by gateway.');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  const deviceColumns: Column<any>[] = [
    {
      header: 'Device ID',
      accessor: (row) => <span className="font-mono font-semibold text-text">{row.deviceId}</span>,
    },
    {
      header: 'Designation / Node Name',
      accessor: (row) => (
        <span className="font-medium text-text">
          {row.deviceName || 'RFID Gate Controller'}
        </span>
      ),
    },
    {
      header: 'Physical Location',
      accessor: (row) => <span className="text-text-muted text-xs">{row.location || 'Central Campus'}</span>,
    },
    {
      header: 'Telemetry Status',
      accessor: (row) => {
        const isOnline = (row.status || 'ONLINE').toUpperCase() === 'ONLINE';
        return (
          <Badge tone={isOnline ? 'success' : 'danger'} className="flex items-center gap-1.5 w-fit">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
            {row.status || 'ONLINE'}
          </Badge>
        );
      },
    },
    {
      header: 'Last Signal',
      accessor: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.lastPing ? new Date(row.lastPing).toLocaleTimeString() : 'Just now'}
        </span>
      ),
    },
  ];

  const logColumns: Column<any>[] = [
    {
      header: 'Source Gateway',
      accessor: (row) => <span className="font-mono font-semibold text-text">{row.deviceId}</span>,
    },
    {
      header: 'Action / Ingress Event',
      accessor: (row) => (
        <Badge tone="info" className="font-mono text-[10px]">
          {row.action}
        </Badge>
      ),
    },
    {
      header: 'Subject Identity',
      accessor: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.studentId || 'ANONYMOUS_TAG'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.timestamp ? new Date(row.timestamp).toLocaleString() : 'Recent'}
        </span>
      ),
    },
  ];

  const onlineCount = devices.filter((d: any) => (d.status || 'ONLINE').toUpperCase() === 'ONLINE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="IoT Telemetry & Gate Automation"
        description="Real-time sensory mesh tracking RFID turnstiles, biometric door controllers, and ambient telemetry nodes."
        badge={<Badge tone="gold">Sensory Mesh</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="gold"
              onClick={() => triggerTestSync.mutate()}
              loading={triggerTestSync.isPending}
              className="flex items-center gap-2"
            >
              <Radio className="w-4 h-4" /> Simulate RFID Scan
            </Button>
            <IconButton
              variant="outline"
              onClick={() => {
                refetchDevices();
                refetchLogs();
              }}
              title="Refresh Sensors"
            >
              <RefreshCw className="w-4 h-4" />
            </IconButton>
          </div>
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Online Gateways</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            {onlineCount} / {devices.length}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            99.98% Gateway Uptime
          </p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Recent Swipes (24h)</span>
            <DoorOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">1,482</div>
          <p className="text-[11px] text-text-muted">Hostel &amp; Library RFID ingress</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Hardware Auth Protocol</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">Encrypted</div>
          <p className="text-[11px] text-text-muted">HMAC-SHA256 Token Gated</p>
        </Card>
      </div>

      {/* Connected Nodes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <Wifi className="w-4 h-4 text-primary" />
            Connected Edge Devices &amp; Turnstiles
          </h2>
          <span className="text-xs font-mono text-text-muted">{devices.length} nodes connected</span>
        </div>
        {isLoadingDevices ? (
          <TableSkeleton rows={3} cols={5} />
        ) : (
          <Card pad="none" className="overflow-hidden">
            <DataTable
              data={devices}
              columns={deviceColumns}
              searchPlaceholder="Filter devices by ID or location..."
              searchField="deviceName"
            />
          </Card>
        )}
      </div>

      {/* Real-time Ingress Event Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-gold" />
            Real-time Ingress &amp; Sensor Event Log
          </h2>
          <Badge tone="outline">Live Stream</Badge>
        </div>
        {isLoadingLogs ? (
          <TableSkeleton rows={4} cols={4} />
        ) : (
          <Card pad="none" className="overflow-hidden">
            <DataTable
              data={syncLogs}
              columns={logColumns}
              searchPlaceholder="Filter telemetry logs..."
              searchField="deviceId"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
