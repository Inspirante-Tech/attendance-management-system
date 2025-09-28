import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeacherAPI } from "@/lib/teacher-api";

export default function MarksTable({
  courseId,
  teacherId,
}: {
  courseId: string;
  teacherId: string;
}) {
  const [components, setComponents] = useState<
    { id: string; name: string; type: string; maxMarks?: number }[]
  >([]);
  const [students, setStudents] = useState<
    {
      usn: string;
      name: string;
      course: string;
      marks: { testComponentId: string; marksObtained: number | null }[];
      updatedAt: string;
      enrollmentId: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // fetch test components via TeacherAPI
        const compRes = await TeacherAPI.getCourseTestComponents(courseId, teacherId);
        setComponents(compRes.components || []);

        // fetch student marks via TeacherAPI
        const markRes = await TeacherAPI.getCourseStudentMarks(courseId, teacherId);

        const studentData = markRes.map((s: any) => ({
          usn: s.usn,
          name: s.name,
          course: s.course || `${courseId}`,
          updatedAt: s.updatedAt || "N/A",
          enrollmentId: s.enrollmentId,
          marks: [...s.theoryMarks, ...s.labMarks].map((m: any) => ({
            testComponentId: m.testId,
            marksObtained: m.marksObtained,
          })),
        }));

        setStudents(studentData);
      } catch (err) {
        console.error("Error fetching marks/components:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, teacherId]);

  const theoryComponents = components.filter((c) => c.type === "theory");
  const labComponents = components.filter((c) => c.type === "lab");

  const calculateTotal = (
    marks: { testComponentId: string; marksObtained: number | null }[],
    comps: typeof components
  ) =>
    comps.reduce(
      (sum, c) =>
        sum +
        (marks.find((m) => m.testComponentId === c.id)?.marksObtained || 0),
      0
    );

  const handleMarkChange = async (
    enrollmentId: string,
    componentId: string,
    value: number | null
  ) => {
    try {
      await TeacherAPI.updateStudentMark(enrollmentId, componentId, value);

      setStudents((prev) =>
        prev.map((s) =>
          s.enrollmentId === enrollmentId
            ? {
                ...s,
                marks: s.marks.map((m) =>
                  m.testComponentId === componentId
                    ? { ...m, marksObtained: value }
                    : m
                ),
              }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to update mark:", err);
      alert("Failed to update mark. Please try again.");
    }
  };

  if (loading) return <div>Loading marks table...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead rowSpan={2}>STUDENT USN & NAME</TableHead>
          <TableHead rowSpan={2}>COURSE CODE & NAME</TableHead>
          {theoryComponents.length > 0 && (
            <TableHead
              colSpan={theoryComponents.length + 1}
              className="text-center"
            >
              THEORY MARKS
            </TableHead>
          )}
          {labComponents.length > 0 && (
            <TableHead colSpan={labComponents.length + 1} className="text-center">
              LAB MARKS
            </TableHead>
          )}
          <TableHead rowSpan={2}>LAST UPDATED</TableHead>
        </TableRow>
        <TableRow>
          {theoryComponents.map((tc) => (
            <TableHead key={tc.id}>{tc.name}</TableHead>
          ))}
          <TableHead>THEORY TOTAL</TableHead>
          {labComponents.map((tc) => (
            <TableHead key={tc.id}>{tc.name}</TableHead>
          ))}
          <TableHead>LAB TOTAL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.usn}>
            <TableCell>
              <div className="font-bold">{student.usn}</div>
              <div>{student.name}</div>
            </TableCell>
            <TableCell>{student.course}</TableCell>

            {theoryComponents.map((tc) => {
              const mark = student.marks.find((m) => m.testComponentId === tc.id);
              return <TableCell key={tc.id}>{mark?.marksObtained ?? "-"}</TableCell>;
            })}
            <TableCell className="text-green-600 font-bold">
              {calculateTotal(student.marks, theoryComponents)}
            </TableCell>

            {labComponents.map((tc) => {
              const mark = student.marks.find((m) => m.testComponentId === tc.id);
              return <TableCell key={tc.id}>{mark?.marksObtained ?? "-"}</TableCell>;
            })}
            <TableCell className="text-green-600 font-bold">
              {calculateTotal(student.marks, labComponents)}
            </TableCell>

            <TableCell>{student.updatedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
