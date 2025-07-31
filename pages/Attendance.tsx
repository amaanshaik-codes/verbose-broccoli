
import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

const Attendance: React.FC = () => {
  const { students, loading, submitAttendance, getAttendanceForDate } = useStore();
  const [presentStudents, setPresentStudents] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const today = new Date();
  const todayString = format(today, 'EEEE, do MMMM yyyy');
  
  useEffect(() => {
    const todaysRecord = getAttendanceForDate(today);
    if (todaysRecord) {
      setPresentStudents(new Set(todaysRecord.present));
    }
  }, [getAttendanceForDate, today]);
  
  const handleToggleStudent = (studentId: string) => {
    setPresentStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const markAll = (present: boolean) => {
    if (present) {
      setPresentStudents(new Set(students.map(s => s.id)));
    } else {
      setPresentStudents(new Set());
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitAttendance(Array.from(presentStudents), today);
    setIsSubmitting(false);
    toast.success('Attendance submitted successfully!');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  const presentCount = presentStudents.size;
  const absentCount = students.length - presentCount;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h2>
          <p className="text-gray-500 dark:text-dark-text-secondary">{todayString}</p>
        </div>
        
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-gray-200 dark:border-dark-border">
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-green-500">
                <Check size={20} />
                <span className="font-semibold">{presentCount} Present</span>
             </div>
             <div className="flex items-center gap-2 text-red-500">
                <X size={20} />
                <span className="font-semibold">{absentCount} Absent</span>
             </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => markAll(true)}>Mark All Present</Button>
            <Button variant="secondary" size="sm" onClick={() => markAll(false)}>Mark All Absent</Button>
          </div>
        </div>
        
        <ul className="divide-y divide-gray-200 dark:divide-dark-border max-h-[50vh] overflow-y-auto">
          {students.map(student => (
            <li key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4 font-bold text-gray-600 dark:text-dark-text-secondary">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-dark-text">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{student.id}</p>
                </div>
              </div>
              <Checkbox
                checked={presentStudents.has(student.id)}
                onChange={() => handleToggleStudent(student.id)}
              />
            </li>
          ))}
        </ul>
        
        <div className="p-4 border-t border-gray-200 dark:border-dark-border text-right">
          <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
