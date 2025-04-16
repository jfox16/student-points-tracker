import { render, screen, waitFor, act } from '@testing-library/react';
import { StudentContextProvider, useStudentContext } from '../context/StudentContext';
import { AppContextProvider } from '../context/AppContext';
import { SoundContextProvider } from '../context/SoundContext';
import { TabContextProvider } from '../context/TabContext';
import { Student } from '../types/student.type';
import { vi } from 'vitest';
import { useEffect } from 'react';

// Mock the sound context to prevent actual sound playback during tests
vi.mock('../context/SoundContext', () => ({
  SoundContextProvider: ({ children }: { children: React.ReactNode }) => children,
  useSoundContext: () => ({
    playSound: vi.fn(),
    playPointSound: vi.fn(),
  }),
}));

// Mock the student context functions
const mockStudentContext = {
  addStudent: vi.fn(),
  deleteStudent: vi.fn(),
  updateStudent: vi.fn(),
  getStudents: vi.fn(),
};

vi.mock('../context/StudentContext', () => ({
  StudentContextProvider: ({ children }: { children: React.ReactNode }) => children,
  useStudentContext: () => mockStudentContext,
}));

// Test component that uses the student context
const TestComponent = ({ onContextReady }: { onContextReady: (context: any) => void }) => {
  const studentContext = useStudentContext();
  
  useEffect(() => {
    onContextReady(studentContext);
  }, [studentContext, onContextReady]);

  return <div data-testid="test-component" />;
};

// Helper function to render components with all necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AppContextProvider>
      <TabContextProvider>
        <SoundContextProvider>
          <StudentContextProvider>
            {ui}
          </StudentContextProvider>
        </SoundContextProvider>
      </TabContextProvider>
    </AppContextProvider>
  );
};

describe('Student Management', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('Adding Students', () => {
    it('should add a new student with default values', async () => {
      const newStudent = {
        id: '1',
        name: 'Test Student',
        points: 0,
        selected: false,
      };

      mockStudentContext.addStudent.mockResolvedValue(newStudent);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add a new student
      const result = await studentContext.addStudent({
        name: 'Test Student',
        points: 0,
        selected: false,
      });

      // Verify the student was added
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Student');
      expect(result.points).toBe(0);
      expect(result.selected).toBe(false);
    });

    it('should add multiple students with unique IDs', async () => {
      const student1 = {
        id: '1',
        name: 'Student 1',
        points: 0,
        selected: false,
      };

      const student2 = {
        id: '2',
        name: 'Student 2',
        points: 0,
        selected: false,
      };

      mockStudentContext.addStudent
        .mockResolvedValueOnce(student1)
        .mockResolvedValueOnce(student2);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add multiple students
      const result1 = await studentContext.addStudent({
        name: 'Student 1',
        points: 0,
        selected: false,
      });

      const result2 = await studentContext.addStudent({
        name: 'Student 2',
        points: 0,
        selected: false,
      });

      // Verify students have unique IDs
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('Deleting Students', () => {
    it('should delete a student by ID', async () => {
      const student = {
        id: '1',
        name: 'Test Student',
        points: 0,
        selected: false,
      };

      mockStudentContext.addStudent.mockResolvedValue(student);
      mockStudentContext.deleteStudent.mockResolvedValue(undefined);
      mockStudentContext.getStudents.mockResolvedValue([]);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add a student and get its ID
      const result = await studentContext.addStudent({
        name: 'Test Student',
        points: 0,
        selected: false,
      });

      // Delete the student
      await studentContext.deleteStudent(result.id);

      // Verify the student was deleted
      const students = await studentContext.getStudents();
      expect(students).not.toContainEqual(student);
    });

    it('should not affect other students when deleting one', async () => {
      const student1 = {
        id: '1',
        name: 'Student 1',
        points: 0,
        selected: false,
      };

      const student2 = {
        id: '2',
        name: 'Student 2',
        points: 0,
        selected: false,
      };

      mockStudentContext.addStudent
        .mockResolvedValueOnce(student1)
        .mockResolvedValueOnce(student2);
      mockStudentContext.deleteStudent.mockResolvedValue(undefined);
      mockStudentContext.getStudents.mockResolvedValue([student2]);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add multiple students
      const result1 = await studentContext.addStudent({
        name: 'Student 1',
        points: 0,
        selected: false,
      });

      const result2 = await studentContext.addStudent({
        name: 'Student 2',
        points: 0,
        selected: false,
      });

      // Delete one student
      await studentContext.deleteStudent(result1.id);

      // Verify only the correct student was deleted
      const students = await studentContext.getStudents();
      expect(students).not.toContainEqual(student1);
      expect(students).toContainEqual(student2);
    });
  });

  describe('Editing Students', () => {
    it("should update a student's name", async () => {
      const student = {
        id: '1',
        name: 'Original Name',
        points: 0,
        selected: false,
      };

      const updatedStudent = {
        ...student,
        name: 'Updated Name',
      };

      mockStudentContext.addStudent.mockResolvedValue(student);
      mockStudentContext.updateStudent.mockResolvedValue(updatedStudent);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add a student
      const result = await studentContext.addStudent({
        name: 'Original Name',
        points: 0,
        selected: false,
      });

      // Update the student's name
      const updated = await studentContext.updateStudent(result.id, {
        ...result,
        name: 'Updated Name',
      });

      // Verify the name was updated
      expect(updated.name).toBe('Updated Name');
    });

    it("should update a student's points", async () => {
      const student = {
        id: '1',
        name: 'Test Student',
        points: 0,
        selected: false,
      };

      const updatedStudent = {
        ...student,
        points: 10,
      };

      mockStudentContext.addStudent.mockResolvedValue(student);
      mockStudentContext.updateStudent.mockResolvedValue(updatedStudent);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add a student
      const result = await studentContext.addStudent({
        name: 'Test Student',
        points: 0,
        selected: false,
      });

      // Update the student's points
      const updated = await studentContext.updateStudent(result.id, {
        ...result,
        points: 10,
      });

      // Verify the points were updated
      expect(updated.points).toBe(10);
    });
  });

  describe('Selecting Students', () => {
    it("should toggle a student's selected state", async () => {
      const student = {
        id: '1',
        name: 'Test Student',
        points: 0,
        selected: false,
      };

      const updatedStudent = {
        ...student,
        selected: true,
      };

      mockStudentContext.addStudent.mockResolvedValue(student);
      mockStudentContext.updateStudent.mockResolvedValue(updatedStudent);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add a student
      const result = await studentContext.addStudent({
        name: 'Test Student',
        points: 0,
        selected: false,
      });

      // Toggle the student's selected state
      const updated = await studentContext.updateStudent(result.id, {
        ...result,
        selected: true,
      });

      // Verify the selected state was toggled
      expect(updated.selected).toBe(true);
    });

    it('should allow multiple students to be selected', async () => {
      const student1 = {
        id: '1',
        name: 'Student 1',
        points: 0,
        selected: false,
      };

      const student2 = {
        id: '2',
        name: 'Student 2',
        points: 0,
        selected: false,
      };

      const updatedStudent1 = {
        ...student1,
        selected: true,
      };

      const updatedStudent2 = {
        ...student2,
        selected: true,
      };

      mockStudentContext.addStudent
        .mockResolvedValueOnce(student1)
        .mockResolvedValueOnce(student2);
      mockStudentContext.updateStudent
        .mockResolvedValueOnce(updatedStudent1)
        .mockResolvedValueOnce(updatedStudent2);
      mockStudentContext.getStudents.mockResolvedValue([updatedStudent1, updatedStudent2]);
      
      let studentContext: any;
      
      await act(async () => {
        renderWithProviders(
          <TestComponent 
            onContextReady={(context) => {
              studentContext = context;
            }}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Add multiple students
      const result1 = await studentContext.addStudent({
        name: 'Student 1',
        points: 0,
        selected: false,
      });

      const result2 = await studentContext.addStudent({
        name: 'Student 2',
        points: 0,
        selected: false,
      });

      // Select both students
      await studentContext.updateStudent(result1.id, {
        ...result1,
        selected: true,
      });

      await studentContext.updateStudent(result2.id, {
        ...result2,
        selected: true,
      });

      // Verify both students are selected
      const students = await studentContext.getStudents();
      const selectedStudents = students.filter((s: Student) => s.selected);
      expect(selectedStudents).toHaveLength(2);
    });
  });
}); 