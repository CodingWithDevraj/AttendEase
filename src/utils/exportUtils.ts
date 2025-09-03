// import { AttendanceRecord } from '../contexts/AttendanceContext';
// import { mockUsers } from '../data/mockData';
// import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// // Helper function to escape CSV values
// const escapeCSV = (value: string | number): string => {
//   const stringValue = String(value);
//   if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
//     return `"${stringValue.replace(/"/g, '""')}"`;
//   }
//   return stringValue;
// };

// export const exportToCSV = (records: AttendanceRecord[], dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
//   try {
//     console.log('exportToCSV: Starting export process.', { records, dateRange, selectedDate });
//     // Filter records based on date range
//     const filteredRecords = filterRecordsByDateRange(records, dateRange, selectedDate);
    
//     if (filteredRecords.length === 0) {
//       alert('No records found for the selected date range.');
//       console.log('exportToCSV: No records found for the selected date range.');
//       return;
//     }
//     console.log('exportToCSV: Filtered records count:', filteredRecords.length);
    
//     // Get headers
//     const headers = ['Date', 'Employee', 'Department', 'Status', 'Punch In', 'Punch Out', 'Working Hours'];
    
//     // Prepare data
//     const data = filteredRecords.map(record => {
//       const user = mockUsers.find(u => u.id === record.userId);
//       let workingHours = "-";
//       let workingMinutes = 0;
      
//       if (record.punchInTime && record.punchOutTime) {
//         const [inHours, inMinutes] = record.punchInTime.split(':').map(Number);
//         const [outHours, outMinutes] = record.punchOutTime.split(':').map(Number);
        
//         const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
//         const hours = Math.floor(totalMinutes / 60);
//         const minutes = totalMinutes % 60;
        
//         workingHours = `${hours}h ${minutes}m`;
//         workingMinutes = totalMinutes;
//       }
      
//       return {
//         date: format(parseISO(record.date), 'MMM dd, yyyy'),
//         name: user?.name || 'Unknown',
//         department: user?.department || 'Not Assigned',
//         status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
//         punchIn: record.punchInTime || "-",
//         punchOut: record.punchOutTime || "-",
//         workingHours,
//         workingMinutes
//       };
//     });

//     // Calculate summary statistics
//     const totalRecords = data.length;
//     const presentCount = data.filter(r => r.status === 'Present').length;
//     const absentCount = data.filter(r => r.status === 'Absent').length;
//     const halfDayCount = data.filter(r => r.status === 'Half-day').length;
//     const totalWorkingMinutes = data.reduce((sum, r) => sum + r.workingMinutes, 0);
//     const avgWorkingHours = totalWorkingMinutes / presentCount;
//     const avgWorkingHoursFormatted = `${Math.floor(avgWorkingHours / 60)}h ${Math.round(avgWorkingHours % 60)}m`;

//     // Convert data to CSV rows
//     const csvRows = data.map(record => [
//       record.date,
//       record.name,
//       record.department,
//       record.status,
//       record.punchIn,
//       record.punchOut,
//       record.workingHours
//     ].map(escapeCSV));

//     // Add summary rows
//     const summaryRows = [
//       [''],
//       ['Summary Statistics'],
//       ['Total Records', totalRecords],
//       ['Present', presentCount],
//       ['Absent', absentCount],
//       ['Half Day', halfDayCount],
//       ['Average Working Hours', avgWorkingHoursFormatted]
//     ].map(row => row.map(escapeCSV));
    
//     // Create CSV content with BOM for Excel compatibility
//     const BOM = '\uFEFF';
//     const csvContent = BOM + [
//       headers.map(escapeCSV).join(','),
//       ...csvRows.map(row => row.join(',')),
//       ...summaryRows.map(row => row.join(','))
//     ].join('\n');
//     console.log('exportToCSV: CSV content created.');
    
//     // Create and download file
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     const dateRangeText = getDateRangeText(dateRange, selectedDate).replace(/[^a-zA-Z0-9]/g, '_');
//     const fileName = `attendance_report_${dateRangeText}_${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    
//     link.setAttribute('href', url);
//     link.setAttribute('download', fileName);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//     console.log('exportToCSV: File download initiated.');
//   } catch (error) {
//     console.error('exportToCSV: Error during export:', error);
//     alert('Failed to export data. Please try again.');
//   }
// };

// export const exportToPDF = (records: AttendanceRecord[], dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
//   try {
//     console.log('exportToPDF: Starting export process.', { records, dateRange, selectedDate });
//     // Filter records based on date range
//     const filteredRecords = filterRecordsByDateRange(records, dateRange, selectedDate);
    
//     if (filteredRecords.length === 0) {
//       alert('No records found for the selected date range.');
//       console.log('exportToPDF: No records found for the selected date range.');
//       return;
//     }
//     console.log('exportToPDF: Filtered records count:', filteredRecords.length);
    
//     // Create PDF document
//     const doc = new jsPDF();
//     console.log('exportToPDF: jsPDF document created.');
    
//     // Add title
//     const title = `Attendance Report - ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} of ${format(selectedDate, 'MMMM d, yyyy')}`;
//     doc.setFontSize(16);
//     doc.text(title, 14, 15);
    
//     // Add date range
//     doc.setFontSize(10);
//     const dateRangeText = getDateRangeText(dateRange, selectedDate);
//     doc.text(dateRangeText, 14, 25);
    
//     // Add total records count
//     doc.text(`Total Records: ${filteredRecords.length}`, 14, 32);
//     console.log('exportToPDF: Title, date range, and total records added.');
    
//     // Prepare table data
//     const tableData = filteredRecords.map(record => {
//       const user = mockUsers.find(u => u.id === record.userId);
//       let workingHours = "-";
      
//       if (record.punchInTime && record.punchOutTime) {
//         const [inHours, inMinutes] = record.punchInTime.split(':').map(Number);
//         const [outHours, outMinutes] = record.punchOutTime.split(':').map(Number);
        
//         const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
//         const hours = Math.floor(totalMinutes / 60);
//         const minutes = totalMinutes % 60;
        
//         workingHours = `${hours}h ${minutes}m`;
//       }
      
//       return [
//         format(parseISO(record.date), 'MMM dd, yyyy'),
//         user?.name || 'Unknown',
//         user?.department || 'Not Assigned',
//         record.status.charAt(0).toUpperCase() + record.status.slice(1),
//         record.punchInTime || "-",
//         record.punchOutTime || "-",
//         workingHours
//       ];
//     });
//     console.log('exportToPDF: Table data prepared.', tableData.length, 'rows.');
    
//     // Add table
//     (doc as any).autoTable({
//       head: [['Date', 'Employee', 'Department', 'Status', 'Punch In', 'Punch Out', 'Working Hours']],
//       body: tableData,
//       startY: 40,
//       theme: 'grid',
//       styles: { 
//         fontSize: 8,
//         cellPadding: 2
//       },
//       headStyles: { 
//         fillColor: [79, 70, 229], // Using primary color from your theme
//         textColor: 255,
//         fontStyle: 'bold'
//       },
//       alternateRowStyles: {
//         fillColor: [249, 250, 251] // Light gray for better readability
//       },
//       margin: { top: 40 }
//     });
//     console.log('exportToPDF: Table added to PDF.');
    
//     // Save PDF
//     const fileName = `attendance_${dateRange}_${format(selectedDate, 'yyyy-MM-dd')}.pdf`;
//     console.log('exportToPDF: Attempting to save PDF with filename:', fileName);
//     doc.save(fileName);
//     console.log('exportToPDF: PDF file save initiated.');
//   } catch (error) {
//     console.error('exportToPDF: Error during export:', error);
//     alert('Failed to export data. Please try again.');
//   }
// };

// const filterRecordsByDateRange = (records: AttendanceRecord[], dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
//   try {
//     console.log('filterRecordsByDateRange: Filtering records.', { dateRange, selectedDate });
//     switch (dateRange) {
//       case 'day':
//         return records.filter(record => {
//           const isMatch = record.date === format(selectedDate, 'yyyy-MM-dd');
//           console.log(`Filtering day: record.date=${record.date}, selectedDate=${format(selectedDate, 'yyyy-MM-dd')}, match=${isMatch}`);
//           return isMatch;
//         });
//       case 'week':
//         const weekStart = startOfWeek(selectedDate);
//         const weekEnd = endOfWeek(selectedDate);
//         console.log(`Filtering week: weekStart=${format(weekStart, 'yyyy-MM-dd')}, weekEnd=${format(weekEnd, 'yyyy-MM-dd')}`);
//         return records.filter(record => {
//           const recordDate = parseISO(record.date);
//           const isMatch = recordDate >= weekStart && recordDate <= weekEnd;
//           console.log(`Filtering week record: record.date=${record.date}, recordDate=${format(recordDate, 'yyyy-MM-dd')}, match=${isMatch}`);
//           return isMatch;
//         });
//       case 'month':
//         const monthStart = startOfMonth(selectedDate);
//         const monthEnd = endOfMonth(selectedDate);
//         console.log(`Filtering month: monthStart=${format(monthStart, 'yyyy-MM-dd')}, monthEnd=${format(monthEnd, 'yyyy-MM-dd')}`);
//         return records.filter(record => {
//           const recordDate = parseISO(record.date);
//           const isMatch = recordDate >= monthStart && recordDate <= monthEnd;
//           console.log(`Filtering month record: record.date=${record.date}, recordDate=${format(recordDate, 'yyyy-MM-dd')}, match=${isMatch}`);
//           return isMatch;
//         });
//       default:
//         console.log('filterRecordsByDateRange: No valid dateRange provided, returning all records.');
//         return records;
//     }
//   } catch (error) {
//     console.error('filterRecordsByDateRange: Error filtering records:', error);
//     return [];
//   }
// };

// const getDateRangeText = (dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
//   try {
//     switch (dateRange) {
//       case 'day':
//         return `Date: ${format(selectedDate, 'MMMM d, yyyy')}`;
//       case 'week':
//         return `Week: ${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`;
//       case 'month':
//         return `Month: ${format(selectedDate, 'MMMM yyyy')}`;
//       default:
//         return '';
//     }
//   } catch (error) {
//     console.error('getDateRangeText: Error getting date range text:', error);
//     return '';
//   }
// }; 

import { AttendanceRecord } from '../contexts/AttendanceContext';
import { mockUsers } from '../data/mockData';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper function to escape CSV values
const escapeCSV = (value: string | number): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportToCSV = (records: AttendanceRecord[], dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
  try {
    console.log('exportToCSV: Starting export process.', { records, dateRange, selectedDate });
    const filteredRecords = filterRecordsByDateRange(records, dateRange, selectedDate);
    
    if (filteredRecords.length === 0) {
      alert('No records found for the selected date range.');
      console.log('exportToCSV: No records found for the selected date range.');
      return;
    }

    const headers = ['Date', 'Employee', 'Department', 'Status', 'Punch In', 'Punch Out', 'Working Hours'];

    const data = filteredRecords.map(record => {
      const user = mockUsers.find(u => u.id === record.userId);
      let workingHours = "-";
      let workingMinutes = 0;

      if (record.punchInTime && record.punchOutTime) {
        const [inHours, inMinutes] = record.punchInTime.split(':').map(Number);
        const [outHours, outMinutes] = record.punchOutTime.split(':').map(Number);
        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        workingHours = `${hours}h ${minutes}m`;
        workingMinutes = totalMinutes;
      }

      return {
        date: format(parseISO(record.date), 'MMM dd, yyyy'),
        name: user?.name || 'Unknown',
        department: user?.department || 'Not Assigned',
        status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
        punchIn: record.punchInTime || "-",
        punchOut: record.punchOutTime || "-",
        workingHours,
        workingMinutes
      };
    });

    const totalRecords = data.length;
    const presentCount = data.filter(r => r.status === 'Present').length;
    const absentCount = data.filter(r => r.status === 'Absent').length;
    const halfDayCount = data.filter(r => r.status === 'Half-day').length;
    const totalWorkingMinutes = data.reduce((sum, r) => sum + r.workingMinutes, 0);
    const avgWorkingHours = totalWorkingMinutes / presentCount;
    const avgWorkingHoursFormatted = `${Math.floor(avgWorkingHours / 60)}h ${Math.round(avgWorkingHours % 60)}m`;

    const csvRows = data.map(record => [
      record.date,
      record.name,
      record.department,
      record.status,
      record.punchIn,
      record.punchOut,
      record.workingHours
    ].map(escapeCSV));

    const summaryRows = [
      [''],
      ['Summary Statistics'],
      ['Total Records', totalRecords],
      ['Present', presentCount],
      ['Absent', absentCount],
      ['Half Day', halfDayCount],
      ['Average Working Hours', avgWorkingHoursFormatted]
    ].map(row => row.map(escapeCSV));

    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.map(escapeCSV).join(','),
      ...csvRows.map(row => row.join(',')),
      ...summaryRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateRangeText = getDateRangeText(dateRange, selectedDate).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `attendance_report_${dateRangeText}_${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('exportToCSV: File download initiated.');
  } catch (error) {
    console.error('exportToCSV: Error during export:', error);
    alert('Failed to export data. Please try again.');
  }
};

export const exportToPDF = (records: AttendanceRecord[], dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
  try {
    console.log('exportToPDF: Starting export process.', { records, dateRange, selectedDate });
    const filteredRecords = filterRecordsByDateRange(records, dateRange, selectedDate);

    if (filteredRecords.length === 0) {
      alert('No records found for the selected date range.');
      return;
    }

    const doc = new jsPDF();
    const title = `Attendance Report - ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} of ${format(selectedDate, 'MMMM d, yyyy')}`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    const dateRangeText = getDateRangeText(dateRange, selectedDate);
    doc.text(dateRangeText, 14, 25);
    doc.text(`Total Records: ${filteredRecords.length}`, 14, 32);

    const tableData = filteredRecords.map(record => {
      const user = mockUsers.find(u => u.id === record.userId);
      let workingHours = "-";

      if (record.punchInTime && record.punchOutTime) {
        const [inHours, inMinutes] = record.punchInTime.split(':').map(Number);
        const [outHours, outMinutes] = record.punchOutTime.split(':').map(Number);
        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        workingHours = `${hours}h ${minutes}m`;
      }

      return [
        format(parseISO(record.date), 'MMM dd, yyyy'),
        user?.name || 'Unknown',
        user?.department || 'Not Assigned',
        record.status.charAt(0).toUpperCase() + record.status.slice(1),
        record.punchInTime || "-",
        record.punchOutTime || "-",
        workingHours
      ];
    });

    (doc as any).autoTable({
      head: [['Date', 'Employee', 'Department', 'Status', 'Punch In', 'Punch Out', 'Working Hours']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 40 }
    });

    const fileName = `attendance_${dateRange}_${format(selectedDate, 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('exportToPDF: Error during export:', error);
    alert('Failed to export data. Please try again.');
  }
};

const filterRecordsByDateRange = (records: AttendanceRecord[], dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
  try {
    switch (dateRange) {
      case 'day':
        return records.filter(record => record.date === format(selectedDate, 'yyyy-MM-dd'));
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return records.filter(record => {
          const recordDate = parseISO(record.date);
          return recordDate >= weekStart && recordDate <= weekEnd;
        });
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return records.filter(record => {
          const recordDate = parseISO(record.date);
          return recordDate >= monthStart && recordDate <= monthEnd;
        });
      default:
        return records;
    }
  } catch (error) {
    console.error('filterRecordsByDateRange: Error filtering records:', error);
    return [];
  }
};

const getDateRangeText = (dateRange: 'day' | 'week' | 'month', selectedDate: Date) => {
  try {
    switch (dateRange) {
      case 'day':
        return `Date: ${format(selectedDate, 'MMMM d, yyyy')}`;
      case 'week':
        return `Week: ${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`;
      case 'month':
        return `Month: ${format(selectedDate, 'MMMM yyyy')}`;
      default:
        return '';
    }
  } catch (error) {
    console.error('getDateRangeText: Error getting date range text:', error);
    return '';
  }
};


export const exportIndividualCSV = (
  records: AttendanceRecord[],
  userId: string | number,
  employeeName: string
) => {
  const userRecords = records.filter(record => String(record.userId) === String(userId));

  if (userRecords.length === 0) {
    alert(`No attendance records found for ${employeeName}.`);
    return;
  }

  const headers = ['Date', 'Status', 'Punch In', 'Punch Out', 'Location'];

  const escapeCSV = (value: string | number): string => {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvRows = userRecords.map(record => {
    const location =
      record.location && record.location.lat && record.location.lng
        ? `https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`
        : 'N/A';

    return [
      record.date,
      record.status,
      record.punchInTime || '-',
      record.punchOutTime || '-',
      location
    ].map(escapeCSV);
  });

  const BOM = '\uFEFF'; // Excel compatibility
  const csvContent =
    BOM +
    [
      headers.map(escapeCSV).join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `${employeeName.replace(/\s+/g, '_')}_attendance.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


