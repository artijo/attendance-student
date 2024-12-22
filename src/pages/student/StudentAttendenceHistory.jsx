import axios from "axios";
import { useEffect, useState } from "react";
import { TableAttendenceHistory } from "../../components/studentAttendence/TableAttendenceHistory.jsx"

export const StudentAttendenceHistory = () => {
    const hostName = "http://127.0.0.1:3000/";
    const [attendance, setAttendance] = useState([]);
    const [classroom, setClassroom] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    

    // Fetch classroom data
    const qureyTermByClassroom = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${hostName}s/studentClassroom?student=60070001`);
            setClassroom(response.data);
        } catch (err) {
            setError("Error fetching classroom data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch subject data based on selected classroom
    const qureySubject = async (classroomId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${hostName}s/getSubject?classroom=${classroomId}`);
            setSubjectList(response.data);
        } catch (err) {
            setError("Error fetching subject data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle selection of classroom
    const handleSelectOptionTerm = (value) => {
        setSelectedClassroom(value);
        setSelectedSubject(""); // Reset selected subject when classroom changes
        setSubjectList([]); // Clear subject list to avoid confusion
        if (value) {
            qureySubject(value);
        }
    };

    const handleSelectOptionSubject = (value) => {
        setSelectedSubject(value);
    };

    const handleOnClick = async () => {
        try {
            const response = await axios.get(`${hostName}s/attendenceHistory?classroom=${selectedClassroom}&subject=${selectedSubject}`);
            // setSubjectList(response.data);
            setAttendance(response.data);
            console.log(response.data)
        } catch (err) {
            // setError("Error fetching subject data.");
            console.error(err);
        }
    }

    useEffect(() => {
        qureyTermByClassroom();
    }, []);

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {/* Select classroom */}
            <select
                className="mb-5 p-2 border border-black rounded-md"
                name="term"
                value={selectedClassroom}
                onChange={(e) => handleSelectOptionTerm(e.target.value)}
            >
                <option value="">เลือกปีการศึกษา</option>
                {classroom.map((classroom, index) => (
                    <option value={classroom.classroom.classId} key={index}>
                        ปีการศึกษา {classroom.classroom.academicYear} - เทอม {classroom.classroom.semester}
                    </option>
                ))}
            </select>

            {/* Select subject */}
            {subjectList.length > 0 && (
                <select
                    className="mb-5 p-2 border border-black rounded-md"
                    name="subject"
                    value={selectedSubject}
                    onChange={(e) => handleSelectOptionSubject(e.target.value)}
                >
                    <option value="">เลือกวิชา</option>
                    {subjectList.map((subject, index) => (
                        <option value={subject.subId} key={index}>
                            {subject.subject.subNameThai} ({subject.subject.subNameEng})
                        </option>
                    ))}
                </select>
            )}
            
            {
                attendance.length > 0 ?
                <TableAttendenceHistory attendence={attendance}/> : <></>
            }
        
            {/* View attendance button */}
            <button
                type="button"
                className="p-2 bg-blue-500 text-white rounded-md"
                onClick={() => handleOnClick()}
            >
                ดูประวัติการเข้าเรียน
            </button>
        </div>
    );
};
