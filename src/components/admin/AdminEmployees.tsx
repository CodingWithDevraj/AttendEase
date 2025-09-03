import { useState } from 'react';
import { mockUsers } from '../../data/mockData';
import EmployeeDetailsDashboard from './EmployeeDetailsDashboard';
import { exportIndividualCSV } from '../../utils/exportUtils';
import { useAttendance } from '../../contexts/AttendanceContext';

const AdminEmployees = () => {
  const employees = mockUsers.filter(user => user.role === 'staff');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const { attendanceRecords } = useAttendance(); // ✅ Added this line

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
  };

  const handleCloseEmployeeDetails = () => {
    setSelectedEmployee(null);
  };

  return (
    <div className="p-2 sm:p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Employees</h1>
        <p className="text-text-secondary">View and manage employee records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="edusync-glass-card p-4 md:p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl mr-4">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{employee.name}</h3>
                  <p className="text-sm text-text-secondary">ID: emp{employee.id}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => handleEmployeeClick(employee)}
                className="btn btn-primary w-full"
              >
                View Details
              </button>
              <button
                onClick={() => exportIndividualCSV(attendanceRecords, employee.id, employee.name)}
                style={{
                  width: '100%',
                  backgroundColor: '#6366f1',         // equivalent to indigo-300
                  color: 'white',                   // equivalent to indigo-900
                  fontWeight: 600,                    // font-semibold
                  padding: '0.5rem 1rem',             // py-2 px-4
                  borderRadius: '0.75rem',            // rounded-xl
                  transition: 'background-color 0.2s ease-in-out'
                }}
                // onMouseOver={e => e.currentTarget.style.backgroundColor = '#5A4FCF'} // hover color (indigo-400)
                // onMouseOut={e => e.currentTarget.style.backgroundColor = '#6366f1'}  // reset to original
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#5A4FCF';     // Tailwind: bg-indigo-400
                  e.currentTarget.style.transform = 'scale(1.05)';        // Pop effect
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#6366f1';      // revert color
                  e.currentTarget.style.transform = 'scale(1)';           // reset scale
                }}
              >
                Export CSV
              </button>
            </div>
          </div>
        ))}
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

export default AdminEmployees;
