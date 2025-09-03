import { useState, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Clock, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAttendance } from '../../contexts/AttendanceContext';
import Calendar2 from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const StaffDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { userAttendance, punchIn, punchOut, markAttendance } = useAttendance();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [exportType, setExportType] = useState<'day' | 'week' | 'month'>('day');
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0
  });
  const navigate = useNavigate();
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Calculate statistics for the current staff member
    if (currentUser) {
      const staffAttendance = userAttendance;
      setStats({
        totalDays: staffAttendance.length,
        presentDays: staffAttendance.filter(r => r.status === 'present').length,
        absentDays: staffAttendance.filter(r => r.status === 'absent').length,
        lateDays: staffAttendance.filter(r => r.status === 'half-day').length
      });
    }
  }, [userAttendance, currentUser]);

  // Format the selected date to YYYY-MM-DD for filtering
  // const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // Check if today's attendance is already marked
  const todayAttendance = userAttendance.find(
    record => record.date === format(new Date(), 'yyyy-MM-dd')
  );
  
  const hasPunchedIn = !!todayAttendance?.punchInTime;
  const hasPunchedOut = !!todayAttendance?.punchOutTime;
  
  // Calculate attendance statistics
  // const totalDays = userAttendance.length;
  // const presentDays = userAttendance.filter(record => record.status === 'present').length;
  // const absentDays = userAttendance.filter(record => record.status === 'absent').length;
  // const halfDays = userAttendance.filter(record => record.status === 'half-day').length;
  
  // Sort attendance records by date (newest first)
  const sortedAttendance = [...userAttendance].sort((a, b) => 
    parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );
  
  // Filter attendance records for the selected month
  const selectedMonthAttendance = sortedAttendance.filter(record => {
    const recordDate = parseISO(record.date);
    return recordDate.getMonth() === selectedDate.getMonth() && 
           recordDate.getFullYear() === selectedDate.getFullYear();
  });

  const handlePunchIn = () => {
    if (currentUser) {
      setGeoLoading(true);
      setGeoError(null);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const success = punchIn(currentUser.id, {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            if (!success) {
              setGeoError('You must be within the office premises to mark attendance.');
            }
            setGeoLoading(false);
          },
          (error) => {
            // If denied, mark as absent
            markAttendance(currentUser.id, 'absent');
            setGeoError('Location denied. Marked as absent.');
            setGeoLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        const success = punchIn(currentUser.id, { lat: null, lng: null });
        if (!success) {
          setGeoError('You must be within the office premises to mark attendance.');
        }
        setGeoLoading(false);
      }
    }
  };

  const handlePunchOut = () => {
    if (currentUser) {
      setGeoLoading(true);
      setGeoError(null);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const success = punchOut(currentUser.id, {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            if (!success) {
              setGeoError('You must be within the office premises to mark attendance.');
            }
            setGeoLoading(false);
          },
          (error) => {
            // If denied, mark as absent
            markAttendance(currentUser.id, 'absent');
            setGeoError('Location denied. Marked as absent.');
            setGeoLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        const success = punchOut(currentUser.id, { lat: null, lng: null });
        if (!success) {
          setGeoError('You must be within the office premises to mark attendance.');
        }
        setGeoLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Function to mark specific dates in the calendar with colors
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const record = userAttendance.find(record => 
        isSameDay(parseISO(record.date), date)
      );
      
      if (record) {
        if (record.status === 'present') return 'bg-green-100 text-success';
        if (record.status === 'absent') return 'bg-red-100 text-danger';
        if (record.status === 'half-day') return 'bg-yellow-100 text-warning';
      }
    }
    return null;
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportToCSV(userAttendance, exportType, selectedDate);
    } else {
      exportToPDF(userAttendance, exportType, selectedDate);
    }
  };

  // Prepare data for the chart
  const chartData = [
    { name: 'Present', value: stats.presentDays },
    { name: 'Absent', value: stats.absentDays },
    { name: 'Late', value: stats.lateDays }
  ];

  return (
    <div className="min-h-screen page-background">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-text-primary">Staff Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span className="text-text-secondary">Welcome, {currentUser?.name}</span>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Punch In/Out Section */}
        <div className="edusync-glass-card p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Today's Attendance</h2>
              <p className="text-text-secondary">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{format(currentTime, 'hh:mm:ss a')}</p>
              {geoError && (
                <div className="mt-2 text-sm text-red-600">{geoError}</div>
              )}
              {geoLoading && (
                <div className="mt-2 text-sm text-blue-600">Getting your location...</div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={handlePunchIn}
                disabled={hasPunchedIn}
                className={`w-full sm:w-auto opacity-50 px-4 py-1 border-none rounded-full transition-opacity ${
                  hasPunchedIn
                    ? 'bg-gray-800 text-gray-300 cursor-not-allowed'
                    : 'bg-success text-text-light hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Punch In</span>
                </div>
              </button>
              <button
                onClick={handlePunchOut}
                disabled={!hasPunchedIn || hasPunchedOut}
                className={`w-full sm:w-auto opacity-50 px-4 py-1 border-none rounded-full transition-opacity ${
                  !hasPunchedIn || hasPunchedOut
                    ? 'bg-gray-800 text-gray-300 cursor-not-allowed'
                    : 'bg-danger text-text-light hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Punch Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 stats-grid">
          <div className="stats-card transform hover:scale-105 transition-transform">
            <h3 className="text-text-secondary">Total Days</h3>
            <p className="text-primary">{stats.totalDays}</p>
          </div>
          <div className="stats-card transform hover:scale-105 transition-transform">
            <h3 className="text-text-secondary">Present Days</h3>
            <p className="text-success">{stats.presentDays}</p>
          </div>
          <div className="stats-card transform hover:scale-105 transition-transform">
            <h3 className="text-text-secondary">Absent Days</h3>
            <p className="text-danger">{stats.absentDays}</p>
          </div>
          <div className="stats-card transform hover:scale-105 transition-transform">
            <h3 className="text-text-secondary">Late Days</h3>
            <p className="text-warning">{stats.lateDays}</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="edusync-glass-card p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Export Attendance</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as 'day' | 'week' | 'month')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button
              onClick={() => handleExport('csv')}
              className="btn btn-success flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="edusync-glass-card p-4 md:p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Monthly Attendance Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="edusync-glass-card p-4 md:p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Attendance Calendar</h2>
            <Calendar2
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              className="react-calendar"
              tileClassName={tileClassName}
            />
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="edusync-glass-card p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">Recent Attendance</h2>
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell">Date</th>
                  <th className="table-cell">Status</th>
                  <th className="table-cell">Punch In</th>
                  <th className="table-cell">Punch Out</th>
                </tr>
              </thead>
              <tbody>
                {selectedMonthAttendance.length > 0 ? (
                  selectedMonthAttendance.map(record => (
                    <tr key={record.id} className="table-row">
                      <td className="table-data">{format(parseISO(record.date), 'MMMM d, yyyy')}</td>
                      <td className="table-data">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-success'
                            : record.status === 'absent'
                            ? 'bg-red-100 text-danger'
                            : 'bg-yellow-100 text-warning'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="table-data">{record.punchInTime || '-'}</td>
                      <td className="table-data">{record.punchOutTime || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="table-data text-center">No attendance records for this month.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
