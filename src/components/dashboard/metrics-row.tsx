import React from 'react';
import { View } from 'react-native';
import { Scan } from 'phosphor-react-native/src/icons/Scan';
import { HourglassSimple } from 'phosphor-react-native/src/icons/HourglassSimple';
import { CheckCircle } from 'phosphor-react-native/src/icons/CheckCircle';
import { MetricCard } from './metric-card';

export interface DashboardMetrics {
  totalToday: number;
  pendingCount: number;
  completedCount: number;
}

export interface MetricsRowProps {
  metrics: DashboardMetrics;
  className?: string;
}

/**
 * MetricsRow
 * Equal-width three-column row providing an at-a-glance status summary via NativeWind.
 */
export function MetricsRow({ metrics, className = '' }: MetricsRowProps) {
  return (
    <View
      className={`flex-row px-6 gap-3.5 mb-7 ${className}`}
      accessibilityRole="summary"
      accessibilityLabel="Daily scan metrics glance"
    >
      <MetricCard
        label="Scans Today"
        value={metrics.totalToday}
        icon={Scan}
        iconColor="muted"
        iconWeight="regular"
        accessibilityLabel={`Scans Today: ${metrics.totalToday}`}
      />
      <MetricCard
        label="Pending"
        value={metrics.pendingCount}
        icon={HourglassSimple}
        iconColor="warning"
        iconWeight="regular"
        accessibilityLabel={`Pending scans: ${metrics.pendingCount}`}
      />
      <MetricCard
        label="Completed"
        value={metrics.completedCount}
        icon={CheckCircle}
        iconColor="success"
        iconWeight="fill"
        accessibilityLabel={`Completed scans: ${metrics.completedCount}`}
      />
    </View>
  );
}
