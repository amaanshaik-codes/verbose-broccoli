import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Student, AttendanceRecord } from '../types';
import * as db from '../services/db';
import { format } from 'date-fns';

interface StoreContextType {
  students: Student[];
  attendance: AttendanceRecord[];
  loading: boolean;
  addStudent: (name: string) => Promise<void>;
  updateStudent: (id: string, newName: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  submitAttendance: (presentIds: string[], date: Date) => Promise<void>;
  getAttendanceForDate: (date: Date) => AttendanceRecord | undefined;
  getStudentById: (id: string) => Student | undefined;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, attendanceData] = await Promise.all([
        db.getStudents(),
        db.getAttendance(),
      ]);
      setStudents(studentsData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addStudent = async (name: string) => {
    const newIdNumber = (students.length > 0 ? Math.max(...students.map(s => parseInt(s.id.substring(1)))) : 0) + 1;
    const newId = `S${String(newIdNumber).padStart(2, '0')}`;
    const newStudent: Student = { id: newId, name };
    const updatedStudents = [...students, newStudent];
    await db.saveStudents(updatedStudents);
    setStudents(updatedStudents);
  };

  const updateStudent = async (id: string, newName: string) => {
    const updatedStudents = students.map(s => s.id === id ? { ...s, name: newName } : s);
    await db.saveStudents(updatedStudents);
    setStudents(updatedStudents);
  };

  const deleteStudent = async (id: string) => {
    const updatedStudents = students.filter(s => s.id !== id);
    // Also remove from attendance records
    const updatedAttendance = attendance.map(rec => ({
      ...rec,
      present: rec.present.filter(studentId => studentId !== id),
    }));
    await db.saveStudents(updatedStudents);
    await db.saveAttendance(updatedAttendance);
    setStudents(updatedStudents);
    setAttendance(updatedAttendance);
  };

  const submitAttendance = async (presentIds: string[], date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const updatedAttendance = [...attendance.filter(rec => rec.date !== dateString)];
    updatedAttendance.push({ date: dateString, present: presentIds });
    await db.saveAttendance(updatedAttendance);
    setAttendance(updatedAttendance);
  };

  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return attendance.find(rec => rec.date === dateString);
  };
  
  const getStudentById = (id: string): Student | undefined => {
    return students.find(s => s.id === id);
  }

  const value = useMemo(() => ({
    students,
    attendance,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    submitAttendance,
    getAttendanceForDate,
    getStudentById,
    refreshData: fetchData,
  }), [students, attendance, loading, fetchData]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
