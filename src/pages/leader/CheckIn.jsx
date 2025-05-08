import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { formatDate, formatTitle } from "../../helper";
import { DateTime } from "luxon";

function CheckIn() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const classId = searchParams.get('classId');
    
    const [activity, setActivity] = useState(null);
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedClassroomId, setSelectedClassroomId] = useState('all');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [availableClassrooms, setAvailableClassrooms] = useState([]);
    const [notes, setNotes] = useState({});
    const [studentStatuses, setStudentStatuses] = useState({});
    const [isValidDate, setIsValidDate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLeader, setIsLeader] = useState(false);
    const [currentDate, setCurrentDate] = useState(DateTime.now().setZone(TIME_ZONE).startOf('day'));
    const [classroomStudentCount, setClassroomStudentCount] = useState({
        total: 0,
        present: 0,
        absent: 0
    });

    const checkValidDate = (activity) => {
        const now = DateTime.now().setZone(TIME_ZONE);
        const startDate = DateTime.fromISO(activity.actDate).setZone(TIME_ZONE);
        const endDate = DateTime.fromISO(activity.actDateEnd || activity.actDate).setZone(TIME_ZONE);
        
        return now >= startDate.startOf('day') && now <= endDate.endOf('day');
    };

    const getTodayParticipation = (participations) => {
        if (!participations) return [];
        const today = DateTime.now().setZone(TIME_ZONE).startOf('day');
        return participations.filter(p => {
            const participationDate = DateTime.fromISO(p.joinTimestamp)
                .setZone(TIME_ZONE)
                .startOf('day');
            return participationDate.equals(today);
        });
    };

    // Verify if the user is a class leader for this classroom
    useEffect(() => {
        const verifyLeaderStatus = async () => {
            if (!classId) {
                setError('ไม่พบข้อมูลห้องเรียน กรุณากลับไปเลือกห้องเรียนที่ต้องการ');
                return;
            }
            
            try {
                // Get classrooms where the user is a leader
                const response = await axios.get(`${HOSTNAME}/s/leader/classrooms`);
                const leaderClassrooms = response.data;
                
                // Check if the user is a leader of the requested classroom
                const hasAccess = leaderClassrooms.some(classroom => classroom.classId === classId);
                
                if (!hasAccess) {
                    setError('คุณไม่มีสิทธิ์เข้าถึงกิจกรรมของห้องเรียนนี้ คุณสามารถเช็คชื่อได้เฉพาะห้องเรียนที่คุณเป็นหัวหน้าห้องเท่านั้น');
                    setIsLeader(false);
                } else {
                    setIsLeader(true);
                }
            } catch (err) {
                setError('ไม่สามารถตรวจสอบสิทธิ์การเข้าถึงได้');
                console.error(err);
            }
        };
        
        verifyLeaderStatus();
    }, [classId]);

    useEffect(() => {
        if (!isLeader) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch the activity details with the class ID to ensure proper access control
                const activityResponse = await axios.get(`${HOSTNAME}/s/leader/activity/${id}`);
                const activity = activityResponse.data;
                setActivity(activity);
                
                const canRecordToday = checkValidDate(activity);
                setIsValidDate(canRecordToday);
                
                if (!canRecordToday) {
                    setError('ไม่สามารถบันทึกการเข้าร่วมได้ เนื่องจากวันนี้ไม่อยู่ในช่วงวันที่จัดกิจกรรม');
                    return;
                }

                // Get classroom members for the specific classroom where the user is a leader
                const classroomResponse = await axios.get(`${HOSTNAME}/s/leader/classrooms/${classId}/members`);
                
                if (!classroomResponse.data) {
                    throw new Error('ไม่พบข้อมูลนักเรียนในห้องเรียน');
                }
                
                // Extract classroomMembers from the response
                const classroomMembers = classroomResponse.data || [];
                
                if (!classroomMembers.length) {
                    throw new Error('ไม่พบรายชื่อนักเรียนในห้องเรียน');
                }
                
                setStudents(classroomMembers);

                // Filter today's participations - Only for this classroom
                const todayParticipations = getTodayParticipation(activity.actParticipate);
                
                // Get the student IDs from this classroom
                const classroomStudentIds = classroomMembers.map(member => member.stdId);
                
                // Filter participations to only include students from this classroom
                const classroomParticipations = todayParticipations.filter(
                    participation => classroomStudentIds.includes(participation.stdId)
                );
                
                // Initialize notes from today's participation data only
                const participationNotes = {};
                classroomParticipations.forEach(participation => {
                    participationNotes[participation.stdId] = participation.note || '';
                });
                setNotes(participationNotes);

                // Initialize statuses from today's participation data only for this classroom
                const initialStatuses = {};
                classroomParticipations.forEach(participation => {
                    initialStatuses[participation.stdId] = 'PRESENT';
                });
                setStudentStatuses(initialStatuses);
                
                // Extract classroom info from the first member's classroom data
                if (classroomMembers.length > 0 && classroomMembers[0].classroom) {
                    const classInfo = classroomMembers[0].classroom;
                    
                    setAvailableClassrooms([{
                        classId: classInfo.classId,
                        classLevel: classInfo.classLevel,
                        classRoom: classInfo.classRoom,
                        classType: classInfo.classroomType?.classTypeNameThai
                    }]);
                }
                
                // Set default filter to the current classroom
                setSelectedClassroomId(classId);

                // Calculate attendance statistics for the classroom
                setClassroomStudentCount({
                    total: classroomMembers.length,
                    present: classroomParticipations.length,
                    absent: classroomMembers.length - classroomParticipations.length
                });
                
            } catch (err) {
                setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, classId, isLeader]);

    useEffect(() => {
        let result = [...students];
        
        // Add search functionality
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(student => {
                // Get Thai display for title
                const titleDisplay = formatTitle(student.student?.title);
                const studentName = `${titleDisplay} ${student.student?.fName} ${student.student?.lName}`.toLowerCase();
                const studentId = student.stdId?.toLowerCase() || '';
                const studentNo = student.stdNo?.toString() || '';
                
                return studentName.includes(query) || studentId.includes(query) || studentNo.includes(query);
            });
        }

        result.sort((a, b) => parseInt(a.stdNo) - parseInt(b.stdNo));
        
        setFilteredStudents(result);
    }, [students, searchQuery]);

    useEffect(() => {
        if (students.length === 0) return;

        // Calculate the present count based on students from this classroom only
        const presentCount = students.filter(student => 
            studentStatuses[student.stdId] === 'PRESENT'
        ).length;
        
        setClassroomStudentCount(prev => ({
            ...prev,
            present: presentCount,
            absent: students.length - presentCount
        }));
    }, [studentStatuses, students]);

    const handleAttendanceChange = async (studentId, status, note = notes[studentId] || '') => {
        if (!isValidDate) {
            setError('ไม่สามารถบันทึกการเข้าร่วมได้ เนื่องจากวันนี้ไม่อยู่ในช่วงวันที่จัดกิจกรรม');
            return;
        }

        if (!isLeader) {
            setError('คุณไม่มีสิทธิ์บันทึกการเข้าร่วมกิจกรรมของห้องเรียนนี้');
            return;
        }

        try {
            await axios.post(`${HOSTNAME}/s/leader/activity/${id}/participate`, {
                stdId: studentId,
                status: status,
                note: status === 'ABSENT' ? '' : note,
                classId: classId,
                date: currentDate.toISO() // Always use today's date for checkin
            });
            
            setStudentStatuses(prev => ({
                ...prev,
                [studentId]: status
            }));

            if (status === 'ABSENT') {
                handleNoteChange(studentId, '');
            }

            const response = await axios.get(`${HOSTNAME}/s/leader/activity/${id}`);
            setActivity(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            console.error(err);
        }
    };

    const handleNoteChange = (studentId, note) => {
        setNotes(prev => ({
            ...prev,
            [studentId]: note
        }));
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
        </div>
    );

    if (!isLeader) {
        return (
            <div className="p-4 md:p-6">
                <div className="bg-yellow-50 p-6 rounded-lg text-yellow-700 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-bold mb-2">ไม่มีสิทธิ์เข้าถึงข้อมูล</h3>
                    <p className="mb-4">คุณไม่ได้เป็นหัวหน้าห้องเรียนนี้ คุณสามารถเช็คชื่อได้เฉพาะห้องเรียนที่คุณเป็นหัวหน้าห้องเท่านั้น</p>
                    <Link to="/leader/activities" className="text-primary hover:underline">
                        กลับไปหน้ารายการกิจกรรม
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="block sm:inline">{error}</span>
                    <button 
                        type="button" 
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        onClick={() => setError(null)}
                    >
                        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            
            {activity && (
                <>
                    <div className="bg-white rounded-xl shadow-md border border-line p-6 mb-8">
                        <div className="flex items-center mb-6">
                            <Link
                                to={`/leader/activities?classId=${classId}`}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors group"
                                aria-label="กลับไปหน้ารายการกิจกรรม"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-primary group-hover:text-accent transition-colors"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                    fillRule="evenodd"
                                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                    />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">บันทึกการเข้าร่วมกิจกรรม</h1>
                                <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body">
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm4 5V6a4 4 0 11-8 0v1h8zm-2 6a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-lg">
                                        <span className="font-medium text-text-color">กิจกรรม:</span> 
                                        <span className="ml-2 text-text-color">{activity.actName}</span>
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-lg">
                                        <span className="font-medium text-text-color">วันที่เช็คชื่อ:</span> 
                                        <span className="ml-2 text-text-color">{formatDate(currentDate.toISO())}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-lg">
                                        <span className="font-medium text-text-color">เวลา:</span> 
                                        <span className="ml-2 text-text-color">{activity.actStartTime} - {activity.actEndTime} น.</span>
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-lg">
                                        <span className="font-medium text-text-color">สถานที่:</span> 
                                        <span className="ml-2 text-text-color">{activity.actLocation}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                        <div className="border-b border-line p-6">
                            <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                เช็คชื่อนักเรียนวันที่ {formatDate(currentDate.toISO())}
                                {availableClassrooms.length > 0 && availableClassrooms[0] && (
                                    <span className="ml-2 text-base font-normal text-gray-600">
                                        (ม.{availableClassrooms[0].classLevel}/{availableClassrooms[0].classRoom}
                                        {availableClassrooms[0].classType && ` ${availableClassrooms[0].classType}`})
                                    </span>
                                )}
                            </h2>
                            
                            {!isValidDate ? (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-md flex items-start">
                                    <svg className="h-6 w-6 mr-3 mt-0.5 text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <div>
                                        <p className="font-medium">ไม่สามารถบันทึกการเข้าร่วมได้</p>
                                        <p className="mt-1 text-sm">วันนี้ไม่อยู่ในช่วงวันที่จัดกิจกรรม (วันที่ {formatDate(activity.actDate)} ถึงวันที่ {formatDate(activity.actDateEnd || activity.actDate)})</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border-l-4 border-green-400 text-green-800 p-4 mb-6 rounded-md flex items-start">
                                    <svg className="h-6 w-6 mr-3 mt-0.5 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <div>
                                        <p className="font-medium">คุณกำลังบันทึกการเข้าร่วมสำหรับวันที่ {formatDate(currentDate.toISO())}</p>
                                        <p className="mt-1 text-sm">กดเลือก "เข้าร่วม" หรือ "ไม่เข้าร่วม" สำหรับนักเรียนแต่ละคน</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Show summary of today's attendance for this classroom only */}
                            <div className="mb-4">
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                        สรุปการเข้าร่วมวันนี้ 
                                        {availableClassrooms.length > 0 && availableClassrooms[0] && (
                                            <span className="text-sm text-gray-500 ml-2">
                                                ห้อง ม.{availableClassrooms[0].classLevel}/{availableClassrooms[0].classRoom}
                                            </span>
                                        )}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 mt-3">
                                        <div>
                                            <p className="text-sm text-gray-500">จำนวนนักเรียนทั้งหมด</p>
                                            <p className="text-lg font-bold text-primary">{classroomStudentCount.total} คน</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">เข้าร่วมแล้ว</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {classroomStudentCount.present} คน
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">ยังไม่ได้เข้าร่วม</p>
                                            <p className="text-lg font-bold text-orange-500">
                                                {classroomStudentCount.absent} คน
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Search input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-text-color-alt mb-2 font-body">
                                    ค้นหานักเรียน
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ค้นหาตามชื่อ รหัสนักเรียน หรือเลขที่..."
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    {searchQuery && (
                                        <button 
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Show search results count when searching */}
                            {searchQuery && (
                                <div className="mb-4 text-sm">
                                    <span className="font-medium text-primary">
                                        พบ {filteredStudents.length} คน
                                    </span>
                                    {filteredStudents.length !== students.length && (
                                        <span className="text-text-color-alt"> จากทั้งหมด {students.length} คน</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto w-full">
                            <table className="w-full divide-y divide-line">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">เลขที่</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">รหัสนักเรียน</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-text-color-alt uppercase tracking-wider">สถานะ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">หมายเหตุ</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-line">
                                    {filteredStudents.map((student) => {
                                        const todayParticipation = activity.actParticipate ? activity.actParticipate.find(p => {
                                            const participationDate = DateTime.fromISO(p.joinTimestamp)
                                                .setZone(TIME_ZONE)
                                                .startOf('day');
                                            const today = DateTime.now()
                                                .setZone(TIME_ZONE)
                                                .startOf('day');
                                            return p.stdId === student.stdId && 
                                                  participationDate.equals(today);
                                        }) : null;
                                        
                                        const isAbsent = studentStatuses[student.stdId] === 'ABSENT';
                                        const canAddNote = todayParticipation && !isAbsent;
                                        
                                        return (
                                            <tr key={student.stdId} className={`hover:bg-gray-50 transition-colors duration-150 ${!isValidDate ? 'opacity-60' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-color">{student.stdNo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color-alt">{student.stdId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-text-color">
                                                    {formatTitle(student.student?.title)} {student.student?.fName} {student.student?.lName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-center gap-4">
                                                        <label className={`relative flex items-center gap-2 ${!isValidDate ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            <input
                                                                type="radio"
                                                                name={`status-${student.stdId}`}
                                                                value="PRESENT"
                                                                checked={studentStatuses[student.stdId] === 'PRESENT' || todayParticipation !== undefined}
                                                                onChange={(e) => handleAttendanceChange(student.stdId, e.target.value)}
                                                                className="sr-only peer"
                                                                disabled={!isValidDate}
                                                            />
                                                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-green-600 peer-checked:bg-green-600 flex justify-center items-center">
                                                                <svg className="w-3 h-3 text-white hidden peer-checked:block" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                    <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                                                                </svg>
                                                            </div>
                                                            <span className={`peer-checked:text-green-600 font-medium ${todayParticipation !== undefined ? 'text-green-600' : 'text-gray-600'}`}>เข้าร่วม</span>
                                                        </label>
                                                        <label className={`relative flex items-center gap-2 ${!isValidDate ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            <input
                                                                type="radio"
                                                                name={`status-${student.stdId}`}
                                                                value="ABSENT"
                                                                checked={studentStatuses[student.stdId] === 'ABSENT' || todayParticipation === undefined}
                                                                onChange={(e) => handleAttendanceChange(student.stdId, e.target.value)}
                                                                className="sr-only peer"
                                                                disabled={!isValidDate}
                                                            />
                                                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-red-600 peer-checked:bg-red-600 flex justify-center items-center">
                                                                <svg className="w-3 h-3 text-white hidden peer-checked:block" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                    <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                                                                </svg>
                                                            </div>
                                                            <span className={`peer-checked:text-red-600 font-medium ${todayParticipation === undefined ? 'text-red-600' : 'text-gray-600'}`}>ไม่เข้าร่วม</span>
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        className={`w-full border rounded-lg px-3 py-2 text-sm font-body ${
                                                            !canAddNote ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary focus:border-primary'
                                                        }`}
                                                        placeholder="หมายเหตุ..."
                                                        value={!canAddNote ? '' : (notes[student.stdId] || '')}
                                                        onChange={(e) => {
                                                            if (canAddNote) {
                                                                handleNoteChange(student.stdId, e.target.value);
                                                                handleAttendanceChange(
                                                                    student.stdId,
                                                                    'PRESENT',
                                                                    e.target.value
                                                                );
                                                            }
                                                        }}
                                                        disabled={!canAddNote}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredStudents.length === 0 && (
                                <div className="p-6 text-center text-text-color-alt font-body">
                                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>ไม่พบรายชื่อนักเรียน</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CheckIn;