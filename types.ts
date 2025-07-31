
export interface Student {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  present: string[]; // Array of student IDs
}

export interface StudentStats {
  totalDaysAttended: number;
  currentStreak: number;
  longestStreak: number;
  mostFrequentDay: string;
  consistencyScore: number;
  longestInactiveStreak: number;
}
