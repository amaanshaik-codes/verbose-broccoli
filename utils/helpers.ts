
import { Student, AttendanceRecord, StudentStats } from '../types';
import { eachDayOfInterval, format, isSameDay, parseISO, getDay, subDays } from 'date-fns';

export const calculateStudentStats = (studentId: string, attendanceRecords: AttendanceRecord[], allStudents: Student[]): StudentStats => {
  const sortedRecords = [...attendanceRecords].sort((a, b) => a.date.localeCompare(b.date));
  const totalDaysRecorded = sortedRecords.length;
  
  let totalDaysAttended = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastAttendanceDate: Date | null = null;
  const dayCounts: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  let longestInactiveStreak = 0;
  let currentInactiveStreak = 0;

  // Find the first date a record exists to calculate inactive streaks correctly
  const firstRecordDate = sortedRecords.length > 0 ? parseISO(sortedRecords[0].date) : new Date();
  const allDates = eachDayOfInterval({ start: firstRecordDate, end: new Date() });

  allDates.forEach(date => {
      const record = sortedRecords.find(r => isSameDay(parseISO(r.date), date));
      const isPresent = record ? record.present.includes(studentId) : false;

      if(isPresent) {
          totalDaysAttended++;
          dayCounts[getDay(date)]++;
          currentInactiveStreak = 0;

          if (lastAttendanceDate) {
              const diff = Math.round((date.getTime() - lastAttendanceDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diff === 1) {
                  tempStreak++;
              } else {
                  tempStreak = 1;
              }
          } else {
              tempStreak = 1;
          }
          lastAttendanceDate = date;
          if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
          }
      } else {
        currentInactiveStreak++;
        if (currentInactiveStreak > longestInactiveStreak) {
            longestInactiveStreak = currentInactiveStreak;
        }
        tempStreak = 0; // Reset active streak
      }
  });

  // Check current streak up to today
  if (lastAttendanceDate) {
      const today = new Date();
      const diff = Math.round((today.getTime() - lastAttendanceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
          currentStreak = tempStreak;
      } else {
          currentStreak = 0;
      }
  }

  const daysOfWeek = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  const mostFrequentDayIndex = Object.keys(dayCounts).reduce((a, b) => dayCounts[Number(a)] > dayCounts[Number(b)] ? a : b);
  const mostFrequentDay = totalDaysAttended > 0 ? daysOfWeek[Number(mostFrequentDayIndex)] : 'N/A';

  const consistencyScore = totalDaysRecorded > 0 ? parseFloat(((totalDaysAttended / totalDaysRecorded) * 10).toFixed(1)) : 0;

  return { totalDaysAttended, currentStreak, longestStreak, mostFrequentDay, consistencyScore, longestInactiveStreak };
};

export const exportToCsv = (students: Student[], attendance: AttendanceRecord[]) => {
  let studentCsvContent = "data:text/csv;charset=utf-8,Student ID,Student Name\n";
  students.forEach(student => {
    studentCsvContent += `${student.id},${student.name}\n`;
  });

  let attendanceCsvContent = "data:text/csv;charset=utf-8,Date," + students.map(s => s.name).join(',') + "\n";
  const studentMap = new Map(students.map(s => [s.id, s.name]));
  attendance.forEach(record => {
    let row = record.date;
    students.forEach(student => {
      row += `,${record.present.includes(student.id) ? 'Present' : 'Absent'}`;
    });
    attendanceCsvContent += row + "\n";
  });
  
  downloadCsv(studentCsvContent, 'student_list.csv');
  downloadCsv(attendanceCsvContent, 'attendance_history.csv');
};

const downloadCsv = (content: string, fileName: string) => {
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const generateAttendanceSummaryText = (
  date: Date,
  presentCount: number,
  totalCount: number,
  topStudents: { name: string }[],
  presentStudents: { name:string }[]
): string => {
  const formattedDate = format(date, "EEEE, do MMMM yyyy");
  const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0;

  const summary = `
📅 ${formattedDate}
🧾 Daily Attendance Summary
✅ Present: ${presentCount} / ${totalCount} (${percentage}%)

📈 Most Consistent Students:
${topStudents.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}

🟢 Students Present:
${presentStudents.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}
  `.trim();
  
  return summary;
};
