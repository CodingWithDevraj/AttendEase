export const mockUsers = [
  {
    id: 0,
    username: 'admin',
    email: 'admin@attendease.com',
    password: 'admin2085',
    name: 'Administrator',
    role: 'admin',
  },
  {
    id: 1,
    username: 'dhananjay',
    email: 'dhananjay@attendease.com',
    password: 'dhananjay2085',
    name: 'Dhananjay',
    role: 'staff',
    department: 'Developer'
  },
  {
    id: 2,
    username: 'ritik',
    email: 'ritik@attendease.com',
    password: 'ritik2085',
    name: 'Ritik',
    role: 'staff',
    department: 'Developer'
  },
  {
    id: 3,
    username: 'kushagara',
    email: 'kushagara@attendease.com',
    password: 'kushagara2085',
    name: 'Kushagara',
    role: 'staff',
    department: 'Developer'
  },
  {
    id: 4,
    username: 'gaurav',
    email: 'gaurav@attendease.com',
    password: 'gaurav2085',
    name: 'Gaurav',
    role: 'staff',
    department: 'Developer'
  },
  {
    id: 5,
    username: 'gulista',
    email: 'gulista@attendease.com',
    password: 'gulista2085',
    name: 'Gulista',
    role: 'staff',
    department: 'Counsellor'
  },
  {
    id: 6,
    username: 'shabnoor',
    email: 'shabnoor@attendease.com',
    password: 'shabnoor2085',
    name: 'Shabnoor',
    role: 'staff',
    department: 'Counsellor'
  },
  {
    id: 7,
    username: 'shivani',
    email: 'shivani@attendease.com',
    password: 'shivani2085',
    name: 'Shivani',
    role: 'staff',
    department: 'Counsellor'
  },
  {
    id: 8,
    username: 'kanika',
    email: 'kanika@attendease.com',
    password: 'kanika2085',
    name: 'Kanika',
    role: 'staff',
    department: 'Counsellor'
  },
  {
    id: 9,
    username: 'neha',
    email: 'neha@attendease.com',
    password: 'neha2085',
    name: 'Neha',
    role: 'staff',
    department: 'HR'
  },
  {
    id: 10,
    username: 'kashish',
    email: 'kashish@attendease.com',
    password: 'kashish2085',
    name: 'Kashish',
    role: 'staff',
    department: 'Counsellor'
  },
  {
    id: 11,
    username: 'devraj',
    email: 'devraj@attendease.com',
    password: 'devraj2085',
    name: 'Devraj',
    role: 'staff',
    department: 'Developer'
  },
  {
    id: 13,
    username: 'akash',
    email: 'akash@attendease.com',
    password: 'akash2085',
    name: 'Akash Patel',
    role: 'staff',
    department: 'Developer'
  },
  {
    id: 14,
    username: 'manogya',
    email: 'manogya@attendease.com',
    password: 'manogya2085',
    name: 'Manogya',
    role: 'staff',
    department: 'Developer'
  },
  {
    id: 15,
    username: 'apoorv',
    email: 'apoorv@attendease.com',
    password: 'apoorv2085',
    name: 'Apoorv Singh',
    role: 'staff',
    department: 'Developer'
  },
];

// Generate mock attendance data for the past 30 days
export const mockAttendance = (() => {
  const records = [];
  const today = new Date();
  let id = 1;

  // For each staff member (excluding admin)
  for (let i = 1; i <= 12; i++) {
    // For the past 30 days
    for (let j = 0; j < 30; j++) {
      const date = new Date();
      date.setDate(today.getDate() - j);
      
      // Skip weekends (Saturday and Sunday)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Random status with higher probability for present
      const statuses = ['present', 'present', 'present', 'present', 'absent', 'half-day'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as 'present' | 'absent' | 'half-day';
      
      // Generate random time for punch in (between 8:00 and 9:30)
      const hours = Math.floor(Math.random() * 2) + 8;
      const minutes = Math.floor(Math.random() * 60);
      const punchInTime = randomStatus !== 'absent' ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00` : undefined;
      
      // Generate random time for punch out (between 17:00 and 18:30)
      const outHours = Math.floor(Math.random() * 2) + 17;
      const outMinutes = Math.floor(Math.random() * 60);
      const punchOutTime = randomStatus === 'present' ? `${outHours.toString().padStart(2, '0')}:${outMinutes.toString().padStart(2, '0')}:00` : undefined;
      
      records.push({
        id: id++,
        userId: i,
        date: date.toISOString().split('T')[0],
        status: randomStatus,
        punchInTime,
        punchOutTime,
        notes: randomStatus === 'absent' ? 'Sick leave' : undefined,
        location: Math.random() > 0.2 ? { lat: 28.6 + Math.random() * 0.1, lng: 77.2 + Math.random() * 0.1 } : { lat: null, lng: null }
      });
    }
  }
  
  return records;
})();
