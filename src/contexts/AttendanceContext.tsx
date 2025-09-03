import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { mockAttendance } from '../data/mockData';
import { useAuth } from './AuthContext';

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  status: 'present' | 'absent' | 'half-day';
  punchInTime?: string;
  punchOutTime?: string;
  notes?: string;
  location?: { lat: number | null; lng: number | null };
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  userAttendance: AttendanceRecord[];
  markAttendance: (userId: number, status: 'present' | 'absent' | 'half-day', date?: string) => void;
  punchIn: (userId: number, location?: { lat: number | null; lng: number | null }) => boolean;
  punchOut: (userId: number, location?: { lat: number | null; lng: number | null }) => boolean;
  getAttendanceByDate: (date: string) => AttendanceRecord[];
  getAttendanceByUser: (userId: number) => AttendanceRecord[];
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

interface AttendanceProviderProps {
  children: ReactNode;
}

// Haversine formula to calculate distance between two lat/lng points in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in meters
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
}

const OFFICE_LOCATION = { lat: 30.327224, lng: 78.012583 };
const OFFICE_RADIUS_METERS = 300;

export const AttendanceProvider = ({ children }: AttendanceProviderProps) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Load initial data from localStorage or fall back to mock data
    const storedAttendance = localStorage.getItem('attendanceRecords');
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    } else {
      setAttendanceRecords(mockAttendance);
    }
  }, []);

  // Save to localStorage whenever attendance records change
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords]);

  // Filter attendance for current user
  const userAttendance = attendanceRecords.filter(
    record => currentUser && record.userId === currentUser.id
  );

  const markAttendance = (userId: number, status: 'present' | 'absent' | 'half-day', date = format(new Date(), 'yyyy-MM-dd')) => {
    // Check if record already exists for this user and date
    const existingRecordIndex = attendanceRecords.findIndex(
      record => record.userId === userId && record.date === date
    );

    if (existingRecordIndex !== -1) {
      // Update existing record
      const updatedRecords = [...attendanceRecords];
      updatedRecords[existingRecordIndex] = {
        ...updatedRecords[existingRecordIndex],
        status,
        ...(status === 'present' && !updatedRecords[existingRecordIndex].punchInTime
          ? { punchInTime: format(new Date(), 'HH:mm:ss') }
          : {})
      };
      setAttendanceRecords(updatedRecords);
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: attendanceRecords.length + 1,
        userId,
        date,
        status,
        ...(status === 'present'
          ? { punchInTime: format(new Date(), 'HH:mm:ss') }
          : {})
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
  };

  const punchIn = (userId: number, location?: { lat: number | null; lng: number | null }): boolean => {
    // Geofencing check
    if (location && location.lat !== null && location.lng !== null) {
      const distance = getDistanceFromLatLonInMeters(location.lat, location.lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
      if (distance > OFFICE_RADIUS_METERS) {
        return false; // Outside allowed area
      }
    }
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentTime = format(new Date(), 'HH:mm:ss');
    const existingRecordIndex = attendanceRecords.findIndex(
      record => record.userId === userId && record.date === today
    );
    if (existingRecordIndex !== -1) {
      // Update existing record
      const updatedRecords = [...attendanceRecords];
      updatedRecords[existingRecordIndex] = {
        ...updatedRecords[existingRecordIndex],
        status: 'present',
        punchInTime: currentTime,
        location: location ?? updatedRecords[existingRecordIndex].location ?? { lat: null, lng: null }
      };
      setAttendanceRecords(updatedRecords);
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: attendanceRecords.length + 1,
        userId,
        date: today,
        status: 'present',
        punchInTime: currentTime,
        location: location ?? { lat: null, lng: null }
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
    return true;
  };

  const punchOut = (userId: number, location?: { lat: number | null; lng: number | null }): boolean => {
    // Geofencing check
    if (location && location.lat !== null && location.lng !== null) {
      const distance = getDistanceFromLatLonInMeters(location.lat, location.lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
      if (distance > OFFICE_RADIUS_METERS) {
        return false; // Outside allowed area
      }
    }
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentTime = format(new Date(), 'HH:mm:ss');
    const existingRecordIndex = attendanceRecords.findIndex(
      record => record.userId === userId && record.date === today
    );
    if (existingRecordIndex !== -1) {
      // Update existing record
      const updatedRecords = [...attendanceRecords];
      updatedRecords[existingRecordIndex] = {
        ...updatedRecords[existingRecordIndex],
        punchOutTime: currentTime,
        location: location ?? updatedRecords[existingRecordIndex].location ?? { lat: null, lng: null }
      };
      setAttendanceRecords(updatedRecords);
      return true;
    }
    return false;
  };

  const getAttendanceByDate = (date: string) => {
    return attendanceRecords.filter(record => record.date === date);
  };

  const getAttendanceByUser = (userId: number) => {
    return attendanceRecords.filter(record => record.userId === userId);
  };

  return (
    <AttendanceContext.Provider value={{
      attendanceRecords,
      userAttendance,
      markAttendance,
      punchIn,
      punchOut,
      getAttendanceByDate,
      getAttendanceByUser
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};
