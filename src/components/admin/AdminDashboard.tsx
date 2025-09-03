import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAttendance, AttendanceRecord } from '../../contexts/AttendanceContext';




import EmployeeDetailsDashboard from './EmployeeDetailsDashboard';
import Sidebar from '../Sidebar';


import AdminDashboardContent from './AdminDashboardContent';
import AdminAttendance from './AdminAttendance';
import AdminEmployees from './AdminEmployees';
import AdminCalendar from './AdminCalendar';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { } = useAuth();
  const { attendanceRecords } = useAttendance();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  // Add this state for stats:
  const [, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      try {
        const today = format(selectedDate, 'yyyy-MM-dd');
        const todayData = attendanceRecords.filter((record: AttendanceRecord) => record.date === today);
        
        const uniqueStaffIds = new Set(attendanceRecords.map((r: AttendanceRecord) => r.userId));
        
        setStats({
          totalStaff: uniqueStaffIds.size,
          presentToday: todayData.filter((r: AttendanceRecord) => r.status === 'present').length,
          absentToday: todayData.filter((r: AttendanceRecord) => r.status === 'absent').length,
          lateToday: todayData.filter((r: AttendanceRecord) => r.status === 'half-day').length
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();
  }, [attendanceRecords, selectedDate]);



  
  const handleCloseEmployeeDetails = () => {
    setSelectedEmployee(null);
  };

  // Get today's attendance records
 

  if (isLoading) {
    return (
      <div className="min-h-screen page-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen page-background">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8">
        <Routes>
          <Route index element={<AdminDashboardContent />} />
          <Route path="dashboard" element={<AdminDashboardContent />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="calendar" element={<AdminCalendar />} />
        </Routes>
      </div>
      {selectedEmployee && (
        <EmployeeDetailsDashboard
          employee={selectedEmployee}
          onClose={handleCloseEmployeeDetails}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
