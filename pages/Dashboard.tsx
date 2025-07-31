
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../hooks/useStore';
import { calculateStudentStats } from '../utils/helpers';
import Spinner from '../components/ui/Spinner';
import StatWidget from '../components/StatWidget';
import Card from '../components/ui/Card';
import { format, subDays, isAfter, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { Users, Percent, TrendingUp, Calendar, Zap, Award, BarChart2, AlertTriangle, Coffee, Star } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { students, attendance, loading } = useStore();

  const stats = useMemo(() => {
    if (loading || students.length === 0) {
      return null;
    }

    const today = new Date();
    const recordsWithDates = attendance.map(r => ({ ...r, dateObj: new Date(r.date) }));
    
    // Overall Stats
    const totalPossibleAttendances = recordsWithDates.length * students.length;
    const totalActualAttendances = recordsWithDates.reduce((acc, curr) => acc + curr.present.length, 0);
    const overallAttendance = totalPossibleAttendances > 0 ? (totalActualAttendances / totalPossibleAttendances) * 100 : 0;
    
    // Daily Average
    const averageDailyAttendance = recordsWithDates.length > 0 ? totalActualAttendances / recordsWithDates.length : 0;
    
    // Day of week stats
    const dayOfWeekCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    recordsWithDates.forEach(rec => {
        dayOfWeekCounts[getDay(rec.dateObj)] += rec.present.length;
    });
    const dayOfWeekRecordCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    recordsWithDates.forEach(rec => { dayOfWeekRecordCounts[getDay(rec.dateObj)]++; });
    const dayOfWeekAverages = Object.keys(dayOfWeekCounts).map(day => {
        const d = parseInt(day);
        return dayOfWeekRecordCounts[d] > 0 ? dayOfWeekCounts[d] / dayOfWeekRecordCounts[d] : 0;
    });

    const mostActiveDayIndex = dayOfWeekAverages.indexOf(Math.max(...dayOfWeekAverages));
    const mostActiveDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][mostActiveDayIndex];
    
    // Today's Stats
    const todayRecord = attendance.find(a => a.date === format(today, 'yyyy-MM-dd'));
    const todayPresent = todayRecord ? todayRecord.present.length : 0;
    
    // Student specific stats
    const allStudentStats = students.map(s => ({
      student: s,
      stats: calculateStudentStats(s.id, attendance, students)
    }));

    const topStudents = [...allStudentStats].sort((a, b) => b.stats.consistencyScore - a.stats.consistencyScore).slice(0, 5);
    const lowAttendanceStudents = allStudentStats.filter(s => s.stats.consistencyScore < 5).sort((a,b) => a.stats.consistencyScore - b.stats.consistencyScore);
    const longestClassStreak = Math.max(0, ...allStudentStats.map(s => s.stats.longestStreak));

    // Trend chart data (last 7 days)
    const trendData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, 6 - i);
        const record = attendance.find(a => a.date === format(date, 'yyyy-MM-dd'));
        return {
            name: format(date, 'MMM d'),
            present: record ? record.present.length : 0,
        };
    });

    return {
      overallAttendance,
      averageDailyAttendance,
      mostActiveDay,
      todayPresent,
      topStudents,
      lowAttendanceStudents,
      longestClassStreak,
      trendData
    };
  }, [students, attendance, loading]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  if (!stats) {
    return <div className="text-center text-gray-500 dark:text-dark-text-secondary">No data available to display. Add students and take attendance to see stats.</div>;
  }
  
  const PIE_COLORS = ['#0A84FF', '#e2e8f0'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget icon={<Percent size={24} />} title="Overall Attendance" value={`${stats.overallAttendance.toFixed(1)}%`} />
        <StatWidget icon={<Users size={24} />} title="Avg. Daily" value={stats.averageDailyAttendance.toFixed(1)} subtitle="students/day" />
        <StatWidget icon={<Zap size={24} />} title="Most Active Day" value={stats.mostActiveDay} />
        <StatWidget icon={<Calendar size={24} />} title="Present Today" value={stats.todayPresent} subtitle={`out of ${students.length}`}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Daily Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
              <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)' }} />
              <YAxis tick={{ fill: 'rgb(107 114 128)' }} />
              <Tooltip
                contentStyle={{
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#f9fafb' }}
              />
              <Legend />
              <Bar dataKey="present" fill="#0A84FF" name="Present Students" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Top 5 Regulars</h3>
          <ul className="space-y-4">
            {stats.topStudents.map(({ student, stats: studentStats }, index) => (
              <li key={student.id} className="flex items-center">
                <div className={`mr-4 font-bold text-lg ${index < 3 ? 'text-apple-blue' : 'text-gray-500'}`}>#{index + 1}</div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-dark-text">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Consistency: {studentStats.consistencyScore}/10</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
           <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Highlights</h3>
           <div className="space-y-4">
              <div className="flex items-center">
                <Award size={20} className="text-yellow-500 mr-3" />
                <div>
                  <p className="font-semibold">Longest Class Streak</p>
                  <p className="text-gray-500 dark:text-dark-text-secondary">{stats.longestClassStreak} days</p>
                </div>
              </div>
               <div className="flex items-center">
                <Coffee size={20} className="text-amber-700 mr-3" />
                <div>
                  <p className="font-semibold">Most Common Dropout Day</p>
                  <p className="text-gray-500 dark:text-dark-text-secondary">Tuesdays (coming soon)</p>
                </div>
              </div>
           </div>
        </Card>
        
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Low Attendance Alert</h3>
          {stats.lowAttendanceStudents.length > 0 ? (
            <ul className="space-y-3">
              {stats.lowAttendanceStudents.slice(0, 4).map(({ student, stats: studentStats }) => (
                <li key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                  <div className="flex items-center">
                    <AlertTriangle size={18} className="text-red-500 mr-3" />
                    <p className="font-medium text-gray-800 dark:text-dark-text">{student.name}</p>
                  </div>
                  <p className="text-sm text-red-500">
                    Inactive: {studentStats.longestInactiveStreak} days | Score: {studentStats.consistencyScore}/10
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-dark-text-secondary mt-8">No students with critically low attendance. Great job!</p>
          )}
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;
