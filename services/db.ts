
import { Student, AttendanceRecord } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_PASSWORD } from '../constants';
import { format } from 'date-fns';

// --- INITIAL DUMMY DATA ---
const getInitialStudents = (): Student[] => {
  return [
    { id: 'S01', name: 'Amaan Shaik' },
    { id: 'S02', name: 'Veronika Ahong' },
    { id: 'S03', name: 'Diana Prince' },
    { id: 'S04', name: 'Arjun Reddy' },
    { id: 'S05', name: 'Danish R' },
    { id: 'S06', name: 'Salman Khan' },
    { id: 'S07', name: 'Riya S' },
    { id: 'S08', name: 'Bruce Wayne' },
    { id: 'S09', name: 'Clark Kent' },
    { id: 'S10', name: 'Peter Parker' },
  ];
};

const getInitialAttendance = (): AttendanceRecord[] => {
  const today = new Date();
  const records: AttendanceRecord[] = [];
  const students = getInitialStudents();
  const studentIds = students.map(s => s.id);

  // Generate records for the past 14 days
  for (let i = 14; i > 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Simulate varied attendance
    const presentStudents = studentIds.filter(() => Math.random() > 0.25);
    
    records.push({ date: dateString, present: presentStudents });
  }
  return records;
};

// --- DB HELPER FUNCTIONS ---
const getItem = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setItem = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key “${key}”:`, error);
  }
};

// --- API-LIKE DB FUNCTIONS ---

// Initialize with dummy data if none exists
export const initializeDatabase = (): void => {
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS)) {
    setItem(LOCAL_STORAGE_KEYS.STUDENTS, getInitialStudents());
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ATTENDANCE)) {
    setItem(LOCAL_STORAGE_KEYS.ATTENDANCE, getInitialAttendance());
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.PASSWORD)) {
    setItem(LOCAL_STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD);
  }
};

// STUDENTS
export const getStudents = async (): Promise<Student[]> => {
  return Promise.resolve(getItem<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, []));
};

export const saveStudents = async (students: Student[]): Promise<void> => {
  setItem(LOCAL_STORAGE_KEYS.STUDENTS, students);
  return Promise.resolve();
};

// ATTENDANCE
export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  return Promise.resolve(getItem<AttendanceRecord[]>(LOCAL_STORAGE_KEYS.ATTENDANCE, []));
};

export const saveAttendance = async (records: AttendanceRecord[]): Promise<void> => {
  setItem(LOCAL_STORAGE_KEYS.ATTENDANCE, records);
  return Promise.resolve();
};

// PASSWORD
export const getPassword = async (): Promise<string> => {
  return Promise.resolve(getItem<string>(LOCAL_STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD));
};

export const savePassword = async (password: string): Promise<void> => {
  setItem(LOCAL_STORAGE_KEYS.PASSWORD, password);
  return Promise.resolve();
};

// LAST LOGIN
export const getLastLogin = async (): Promise<string | null> => {
  return Promise.resolve(getItem<string | null>(LOCAL_STORAGE_KEYS.LAST_LOGIN, null));
};

export const saveLastLogin = async (date: string): Promise<void> => {
  setItem(LOCAL_STORAGE_KEYS.LAST_LOGIN, date);
  return Promise.resolve();
};
