import { useState} from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import Calendar2 from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAttendance} from '../../contexts/AttendanceContext';

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { attendanceRecords } = useAttendance();

  // Filter attendance records for the selected month to display in the calendar
  const selectedMonthAttendance = attendanceRecords.filter(record => {
    const recordDate = parseISO(record.date);
    return recordDate.getMonth() === selectedDate.getMonth() && 
           recordDate.getFullYear() === selectedDate.getFullYear();
  });

  // Function to mark specific dates in the calendar with colors based on overall attendance
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const recordsForDate = attendanceRecords.filter(record => 
        isSameDay(parseISO(record.date), date)
      );
      
      if (recordsForDate.length > 0) {
        // Determine overall status for the day (e.g., if any absent, mark red; if all present, mark green)
        const hasAbsent = recordsForDate.some(record => record.status === 'absent');
        const hasHalfDay = recordsForDate.some(record => record.status === 'half-day');
        const allPresent = recordsForDate.every(record => record.status === 'present');

        if (hasAbsent) return 'bg-red-100 text-danger';
        if (hasHalfDay) return 'bg-yellow-100 text-warning';
        if (allPresent) return 'bg-green-100 text-success';
      }
    }
    return null;
  };

  return (
    <div className="p-2 sm:p-4 md:p-8">
      <div className="edusync-glass-card p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">Overall Attendance Calendar</h2>
        <Calendar2
          onChange={(date) => setSelectedDate(date as Date)}
          value={selectedDate}
          className="react-calendar"
          tileClassName={tileClassName}
        />
      </div>
      {/* You can add more insights here based on selectedMonthAttendance if needed */}
      <div className="edusync-glass-card p-4 md:p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Attendance Summary for {format(selectedDate, 'MMMM yyyy')}</h3>
        <ul className="space-y-2">
          {selectedMonthAttendance.length > 0 ? (
            // Group by date and display summary
            Array.from(new Set(selectedMonthAttendance.map(record => record.date)))
              .sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime())
              .map(date => {
                const dailyRecords = selectedMonthAttendance.filter(record => record.date === date);
                const presentCount = dailyRecords.filter(r => r.status === 'present').length;
                const absentCount = dailyRecords.filter(r => r.status === 'absent').length;
                const halfDayCount = dailyRecords.filter(r => r.status === 'half-day').length;

                return (
                  <li key={date} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-text-secondary">{format(parseISO(date), 'MMM d, yyyy')}</span>
                    <div className="flex space-x-4 text-sm">
                      {presentCount > 0 && <span className="text-success">Present: {presentCount}</span>}
                      {absentCount > 0 && <span className="text-danger">Absent: {absentCount}</span>}
                      {halfDayCount > 0 && <span className="text-warning">Half-Day: {halfDayCount}</span>}
                    </div>
                  </li>
                );
              })
          ) : (
            <li className="text-text-secondary">No attendance data for this month.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminCalendar; 