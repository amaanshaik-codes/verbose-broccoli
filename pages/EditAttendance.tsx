
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { format, parseISO } from 'date-fns';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';

const EditAttendance: React.FC = () => {
  const { students, loading, submitAttendance, getAttendanceForDate, attendance } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [presentStudents, setPresentStudents] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDates = useMemo(() => {
    return [...attendance].sort((a,b) => b.date.localeCompare(a.date)).map(a => a.date)
  }, [attendance]);
  
  useEffect(() => {
    const record = getAttendanceForDate(selectedDate);
    if (record) {
      setPresentStudents(new Set(record.present));
    } else {
      setPresentStudents(new Set());
    }
  }, [selectedDate, getAttendanceForDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value);
    setSelectedDate(date);
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitAttendance(Array.from(presentStudents), selectedDate);
    setIsSubmitting(false);
    toast.success('Attendance updated successfully!');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Attendance</h2>
          <p className="text-gray-500 dark:text-dark-text-secondary">Select a date to view or modify records.</p>
        </div>
        
        <div className="p-4">
          <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Select Date</label>
          <Input 
            type="date"
            id="date-select"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        {students.length > 0 ? (
          <>
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        ) : (
          <p className="p-4 text-center text-gray-500 dark:text-dark-text-secondary">No students found. Add students in Settings.</p>
        )}
      </Card>
    </div>
  );
};

export default EditAttendance;
