
import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { Student } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import { savePassword, getPassword } from '../services/db';
import toast from 'react-hot-toast';
import { exportToCsv, generateAttendanceSummaryText, calculateStudentStats } from '../utils/helpers';
import { useTheme } from '../hooks/useTheme';
import { Plus, Trash, Edit, User, Key, Download, Copy, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import { generateAttendanceImage } from '../services/geminiService';
import Spinner from '../components/ui/Spinner';

const Settings: React.FC = () => {
  const { students, attendance, addStudent, updateStudent, deleteStudent, getStudentById, refreshData } = useStore();
  const { theme, toggleTheme } = useTheme();

  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [today] = useState(new Date());

  const openAddModal = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentModalOpen(true);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      await updateStudent(editingStudent.id, studentName);
      toast.success('Student updated!');
    } else {
      await addStudent(studentName);
      toast.success('Student added!');
    }
    setStudentModalOpen(false);
    refreshData();
  };
  
  const handleDeleteStudent = (id: string) => {
    if(window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        deleteStudent(id);
        toast.success('Student deleted.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = await getPassword();
    if (currentPassword !== storedPassword) {
      toast.error('Current password is incorrect.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    await savePassword(newPassword);
    toast.success('Password changed successfully!');
    setPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const handleExport = () => {
    exportToCsv(students, attendance);
    toast.success('CSV files downloaded!');
  };

  const todaysRecord = useMemo(() => attendance.find(a => a.date === today.toISOString().split('T')[0]), [attendance, today]);
  
  const summaryData = useMemo(() => {
    if (!todaysRecord || students.length === 0) return null;

    const presentStudentsList = todaysRecord.present.map(id => getStudentById(id)).filter((s): s is Student => s !== undefined);
    const allStudentStats = students.map(s => ({
      student: s,
      stats: calculateStudentStats(s.id, attendance, students)
    }));
    const topStudentsList = allStudentStats.sort((a,b) => b.stats.consistencyScore - a.stats.consistencyScore).slice(0,3).map(s => s.student);

    return {
      date: today,
      presentCount: todaysRecord.present.length,
      totalCount: students.length,
      topStudents: topStudentsList,
      presentStudents: presentStudentsList
    }
  }, [todaysRecord, students, attendance, getStudentById, today]);

  const handleCopyToClipboard = () => {
    if(!summaryData) {
        toast.error("No attendance taken today to generate summary.");
        return;
    }
    const summaryText = generateAttendanceSummaryText(summaryData.date, summaryData.presentCount, summaryData.totalCount, summaryData.topStudents, summaryData.presentStudents);
    navigator.clipboard.writeText(summaryText);
    toast.success('Summary copied to clipboard!');
  };
  
  const handleGenerateImage = async () => {
     if(!summaryData) {
        toast.error("No attendance taken today to generate summary.");
        return;
    }
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
        const imageUrl = await generateAttendanceImage({
            date: today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            attendancePercentage: Math.round((summaryData.presentCount / summaryData.totalCount) * 100),
            presentCount: summaryData.presentCount,
            absentCount: summaryData.totalCount - summaryData.presentCount,
            topStudents: summaryData.topStudents.map(s => s.name),
            presentStudents: summaryData.presentStudents.map(s => s.name),
        });
        setGeneratedImage(imageUrl);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error(`Image generation failed: ${errorMessage}`);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center"><User className="mr-2"/>Manage Students</h3>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-500 dark:text-dark-text-secondary">Add, edit, or remove students from your class.</p>
          <Button onClick={openAddModal}><Plus className="mr-2 h-4 w-4"/> Add Student</Button>
        </div>
        <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-dark-border">
          <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {students.map(student => (
              <li key={student.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-dark-text">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{student.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(student)}><Edit size={16}/></Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteStudent(student.id)}><Trash size={16}/></Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
           <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center"><Key className="mr-2"/>Security</h3>
           <Button onClick={() => setPasswordModalOpen(true)}>Change Password</Button>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center"><Download className="mr-2"/>Data Export</h3>
          <div className="flex gap-4">
              <Button onClick={handleExport} variant="secondary">Export CSV</Button>
          </div>
        </Card>
      </div>
      
      <Card>
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Share Today's Summary</h3>
          <div className="flex flex-wrap gap-4">
              <Button onClick={handleCopyToClipboard} variant="secondary"><Copy className="mr-2 h-4 w-4"/>Copy Text</Button>
              <Button onClick={() => setCopyModalOpen(true)} variant="secondary"><ImageIcon className="mr-2 h-4 w-4"/>Generate Image</Button>
          </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Appearance</h3>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-dark-text-secondary">Switch between light and dark themes.</p>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-dark-border flex items-center"
          >
            <Sun className={`transition-transform duration-300 ${theme === 'light' ? 'scale-100' : 'scale-0'}`} />
            <Moon className={`absolute transition-transform duration-300 ${theme === 'dark' ? 'scale-100' : 'scale-0'}`} />
          </button>
        </div>
      </Card>

      <div className="text-center text-gray-500 dark:text-dark-text-secondary">
          <p className="font-semibold">Attend V.2</p>
          <p className="text-sm">Crafted by Amaan Shaik</p>
      </div>

      {/* Student Modal */}
      <Modal isOpen={isStudentModalOpen} onClose={() => setStudentModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleStudentSubmit}>
          <Input 
            autoFocus
            placeholder="Student's full name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
            className="mb-4"
          />
          <Button type="submit" className="w-full">{editingStudent ? 'Save Changes' : 'Add Student'}</Button>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" className="w-full">Update Password</Button>
        </form>
      </Modal>
      
      {/* Image Generation Modal */}
      <Modal isOpen={isCopyModalOpen} onClose={() => setCopyModalOpen(false)} title="Generate Summary Image">
        <div className="text-center">
            {isGeneratingImage ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <Spinner />
                    <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">Generating with Gemini...</p>
                </div>
            ) : generatedImage ? (
                <div>
                    <img src={generatedImage} alt="Attendance Summary" className="rounded-lg mb-4"/>
                    <a href={generatedImage} download="attendance-summary.png">
                       <Button className="w-full">Download Image</Button>
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                   <p className="text-gray-600 dark:text-dark-text-secondary">
                     This will use the Gemini API to generate a shareable image for today's attendance summary.
                   </p>
                   <Button onClick={handleGenerateImage} className="w-full">
                     {process.env.API_KEY ? 'Generate Image' : 'API Key not set'}
                   </Button>
                </div>
            )}
        </div>
      </Modal>

    </div>
  );
};

export default Settings;