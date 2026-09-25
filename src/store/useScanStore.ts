import { create } from 'zustand';

export type ScanStatus = 'completed' | 'processing' | 'error';
export type StatusBadgeType = 'processing' | 'ready' | 'printed' | 'error';

export interface ScanRecord {
  id: string;
  patientName: string;
  region: string;
  side: string;
  date: string;
  status: ScanStatus;
  badgeStatus: StatusBadgeType;
  thickness: number;
  density: string;
  strutsEnabled?: boolean;
}

interface ScanStoreState {
  scans: ScanRecord[];
  addScan: (scan: Omit<ScanRecord, 'id' | 'date'> & { id?: string; date?: string }) => void;
}

const INITIAL_SCANS: ScanRecord[] = [
  {
    id: 'scan-1',
    patientName: 'Eleanor Vance',
    region: 'Radius/Ulna',
    side: 'Right',
    date: '10m ago',
    status: 'completed',
    badgeStatus: 'ready',
    thickness: 2.4,
    density: 'Standard',
    strutsEnabled: true,
  },
  {
    id: 'scan-2',
    patientName: 'Marcus Holloway',
    region: 'Navicular',
    side: 'Left',
    date: '24m ago',
    status: 'processing',
    badgeStatus: 'processing',
    thickness: 2.6,
    density: 'High',
    strutsEnabled: true,
  },
  {
    id: 'scan-3',
    patientName: 'David Martinez',
    region: 'Thumb Spica',
    side: 'Bilateral',
    date: '1h ago',
    status: 'completed',
    badgeStatus: 'printed',
    thickness: 2.2,
    density: 'Low',
    strutsEnabled: false,
  },
];

export const useScanStore = create<ScanStoreState>((set) => ({
  scans: INITIAL_SCANS,
  addScan: (newScan) =>
    set((state) => {
      const createdScan: ScanRecord = {
        id: newScan.id || `scan-${Date.now()}`,
        date: newScan.date || 'Just now',
        patientName: newScan.patientName,
        region: newScan.region,
        side: newScan.side,
        status: newScan.status || 'completed',
        badgeStatus: newScan.badgeStatus || 'printed',
        thickness: newScan.thickness,
        density: newScan.density,
        strutsEnabled: newScan.strutsEnabled ?? true,
      };
      return {
        scans: [createdScan, ...state.scans],
      };
    }),
}));
