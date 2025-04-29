import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { HOSTNAME } from '../../config';
import { formatDate, formatTitle } from '../../helper';

function Attendance() {
    const { studingid } = useParams();
    const navigate = useNavigate();
    const [studyTime, setStudyTime] = useState(null);
    const [attendanceStatus, setAttendanceStatus] = useState({});
    const [notes, setNotes] = useState({}); // Add notes state
    const [isSaving, setIsSaving] = useState(false);
    const [changes, setChanges] = useState({}); // Track changes
    const [searchQuery, setSearchQuery] = useState(''); // Add search query state
    const [hasExistingRecords, setHasExistingRecords] = useState(false);

    useEffect(() => {
        axios.get(`${HOSTNAME}/s/leader/studyTime/${studingid}`)
            .then((response) => {
                setStudyTime(response.data);
                // Initialize attendance status from existing data
                const initialStatus = {};
                const initialNotes = {}; // Initialize notes
                const initialChanges = {}; // Track which students need saving
                
                // First check which students have attendance records
                const studentsWithRecords = new Set();
                response.data.attendance.forEach(att => {
                    studentsWithRecords.add(att.stdId);
                });
                
                // Set default "PRESENT" for students without records
                response.data.timetable.classroom.classroomMembers.forEach(member => {
                    if (!studentsWithRecords.has(member.stdId)) {
                        initialStatus[member.stdId] = {
                            status: 'PRESENT', // Default to "PRESENT"
                            method: 'Manual',
                            timestamp: new Date().toISOString()
                        };
                        initialNotes[member.stdId] = '';
                        initialChanges[member.stdId] = true; // Mark as needing to be saved
                    }
                });
                
                // Check if we have at least one existing attendance record
                const hasRecords = response.data.attendance.length > 0;
                setHasExistingRecords(hasRecords);
                
                // Then load actual attendance data for students who have records
                response.data.attendance.forEach(att => {
                    initialStatus[att.stdId] = {
                        status: att.attStatus,
                        method: att.attMethod.attMethodName,
                        timestamp: att.attTimestamp,
                        attId: att.attId, // Store existing attendance ID
                        fromSystem: true // Mark as coming from system
                    };
                    initialNotes[att.stdId] = att.note || ''; // Set initial notes
                });
                
                setAttendanceStatus(initialStatus);
                setNotes(initialNotes);
                
                // If there are students without records, mark them for saving
                if (Object.keys(initialChanges).length > 0) {
                    setChanges(initialChanges);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, [studingid]);

    const handleStatusChange = (stdId, status) => {
        setAttendanceStatus(prev => ({
            ...prev,
            [stdId]: { ...prev[stdId], status }
        }));
        // Track change
        setChanges(prev => ({
            ...prev,
            [stdId]: true
        }));
    };

    const handleNoteChange = (stdId, note) => {
        setNotes(prev => ({
            ...prev,
            [stdId]: note
        }));
        // Track change
        setChanges(prev => ({
            ...prev,
            [stdId]: true
        }));
    };

    const handleSaveAttendance = async () => {
        try {
            setIsSaving(true);
            
            // Collect records that need to be saved
            // These are either new records or modified existing records
            const recordsToSave = Object.keys(attendanceStatus)
                .filter(stdId => {
                    // Include if it's a new record or if it has been changed
                    return !attendanceStatus[stdId]?.attId || changes[stdId];
                })
                .map(stdId => ({
                    attId: attendanceStatus[stdId]?.attId,
                    stdId,
                    studingTimeId: studingid,
                    attStatus: attendanceStatus[stdId]?.status || 'PRESENT',
                    note: notes[stdId] || ''
                }));
            
            if (recordsToSave.length === 0) {
                alert('ไม่มีการเปลี่ยนแปลงข้อมูล');
                setIsSaving(false);
                return;
            }

            // Separate new and existing records
            const newRecords = recordsToSave.filter(record => !record.attId);
            const updatedRecords = recordsToSave.filter(record => record.attId);

            // Send updates in parallel if needed
            await Promise.all([
                newRecords.length > 0 && axios.post(`${HOSTNAME}/s/leader/attendance/bulk`, newRecords),
                updatedRecords.length > 0 && axios.post(`${HOSTNAME}/s/leader/attendance/bulk`, updatedRecords)
            ]);

            alert('บันทึกการเข้าเรียนเรียบร้อย');
            // After saving, mark as having existing records
            setHasExistingRecords(true);
            // Clear changes state
            setChanges({});
            
            navigate(-1);
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsSaving(false);
        }
    };

    // Add reset changes function
    const handleReset = (stdId) => {
        const attendance = studyTime.attendance.find(att => att.stdId === stdId);
        if (attendance) {
            setAttendanceStatus(prev => ({
                ...prev,
                [stdId]: {
                    status: attendance.attStatus,
                    method: attendance.attMethod.attMethodName,
                    timestamp: attendance.attTimestamp,
                    attId: attendance.attId
                }
            }));
            setNotes(prev => ({
                ...prev,
                [stdId]: attendance.note || ''
            }));
            setChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[stdId];
                return newChanges;
            });
        }
    };

    // Filter students based on search query
    const filteredStudents = studyTime?.timetable.classroom.classroomMembers.filter(member => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        const studentName = `${formatTitle(member.student.title)} ${member.student.fName} ${member.student.lName}`.toLowerCase();
        const studentId = member.stdId.toLowerCase();
        const studentNo = member.stdNo.toString();
        
        return studentName.includes(query) || studentId.includes(query) || studentNo.includes(query);
    });

    const statusOptions = [
        { value: 'PRESENT', label: 'มาเรียน', color: 'bg-green-100', hoverColor: 'hover:bg-green-200', borderColor: 'border-green-300' },
        { value: 'ABSENT', label: 'ขาดเรียน', color: 'bg-red-100', hoverColor: 'hover:bg-red-200', borderColor: 'border-red-300' },
        { value: 'LATE', label: 'มาสาย', color: 'bg-yellow-100', hoverColor: 'hover:bg-yellow-200', borderColor: 'border-yellow-300' },
        { value: 'ACTIVITY', label: 'กิจกรรม', color: 'bg-blue-100', hoverColor: 'hover:bg-blue-200', borderColor: 'border-blue-300' },
        { value: 'LEAVE', label: 'ลา', color: 'bg-purple-100', hoverColor: 'hover:bg-purple-200', borderColor: 'border-purple-300' }
    ];

    // Calculate attendance summary
    const calculateSummary = () => {
        if (!attendanceStatus || Object.keys(attendanceStatus).length === 0) return {};
        
        const summary = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            LEAVE: 0,
            ACTIVITY: 0,
            total: 0
        };
        
        Object.values(attendanceStatus).forEach(status => {
            if (status.status) {
                summary[status.status] = (summary[status.status] || 0) + 1;
                summary.total++;
            }
        });
        
        return summary;
    };
    
    const attendanceSummary = calculateSummary();

    return (
        <div>
            {studyTime ? (
                <>
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                                    บันทึกการเข้าเรียน
                                </h1>
                                <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                            </div>
                            
                            <div className="flex items-center gap-2 font-body text-text-color-alt">
                                <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                                    <span className="font-medium text-primary">วันที่:</span> {formatDate(studyTime.studingTimeDate)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
                                <div className="space-y-1">
                                    <p className="text-text-color-alt">วิชา</p>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                        </svg>
                                        <p className="text-text-color font-medium">{studyTime.timetable.subject.subNameThai}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-text-color-alt">เวลา</p>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-text-color">{studyTime.timetable.timeStart.substring(0, 5)} - {studyTime.timetable.timeEnd.substring(0, 5)} น.</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-text-color-alt">ห้องเรียน</p>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                        </svg>
                                        <p className="text-text-color">ม.{studyTime.timetable.classroom.classLevel}/{studyTime.timetable.classroom.classRoom}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                        <div className="border-b border-line p-6">
                            <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                รายชื่อนักเรียน
                            </h2>
                            <p className="text-text-color-alt font-body text-sm">บันทึกสถานะการเข้าเรียนของนักเรียนในคาบเรียนนี้</p>
                            
                            {/* Add attendance summary */}
                            {attendanceSummary.total > 0 && (
                                <div className="mt-4 bg-gray-50 border border-line rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-text-color mb-3 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                        </svg>
                                        สรุปการเข้าเรียน
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {statusOptions.map(option => (
                                            <div key={option.value} className={`flex items-center px-3 py-2 rounded-md ${option.color}`}>
                                                <div className="text-sm mr-2 font-medium">{option.label}:</div>
                                                <div className="text-sm font-bold">
                                                    {attendanceSummary[option.value] || 0} คน
                                                    {attendanceSummary.total > 0 && (
                                                        <span className="text-xs ml-1 text-text-color-alt">
                                                            ({Math.round((attendanceSummary[option.value] || 0) / attendanceSummary.total * 100)}%)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="flex items-center px-3 py-2 rounded-md bg-gray-100">
                                            <div className="text-sm mr-2 font-medium">ทั้งหมด:</div>
                                            <div className="text-sm font-bold">{attendanceSummary.total} คน</div>
                                        </div>
                                    </div>
                                    
                                    {/* Visual progress bar representation */}
                                    <div className="mt-3 h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
                                        {statusOptions.map((option, index) => {
                                            const percentage = (attendanceSummary[option.value] || 0) / attendanceSummary.total * 100;
                                            return (
                                                <div
                                                    key={option.value}
                                                    style={{
                                                        width: `${percentage}%`,
                                                        height: '100%',
                                                    }}
                                                    className={`
                                                        ${option.value === 'PRESENT' ? 'bg-green-500' : ''}
                                                        ${option.value === 'ABSENT' ? 'bg-red-500' : ''}
                                                        ${option.value === 'LATE' ? 'bg-yellow-500' : ''}
                                                        ${option.value === 'ACTIVITY' ? 'bg-blue-500' : ''}
                                                        ${option.value === 'LEAVE' ? 'bg-purple-500' : ''}
                                                    `}
                                                    title={`${option.label}: ${attendanceSummary[option.value] || 0} คน (${Math.round(percentage)}%)`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {/* Search input field */}
                            <div className="mt-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ค้นหาตามชื่อ หรือ เลขที่..."
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
                                {searchQuery && (
                                    <div className="mt-2 text-sm text-primary font-medium">
                                        พบ {filteredStudents.length} คน จากทั้งหมด {studyTime.timetable.classroom.classroomMembers.length} คน
                                    </div>
                                )}
                            </div>
                            
                            {Object.keys(changes).length > 0 && (
                                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-md flex items-start">
                                    <svg className="h-5 w-5 mr-2 mt-0.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium">คุณมีข้อมูลที่ต้องบันทึก {Object.keys(changes).length} รายการ</p>
                                        <p className="text-sm mt-1">กรุณากดปุ่ม "บันทึกการเข้าเรียน" เพื่อบันทึกการเปลี่ยนแปลง</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-white uppercase bg-primary">
                                    <tr>
                                        <th className="px-3 py-3 text-left">เลขที่</th>
                                        <th className="px-3 py-3 text-left">รหัสนักเรียน</th>
                                        <th className="px-3 py-3 text-left">ชื่อ-สกุล</th>
                                        <th className="px-3 py-3">สถานะ</th>
                                        <th className="px-3 py-3">หมายเหตุ</th>
                                        <th className="px-3 py-3 text-center">การบันทึก</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents
                                        ?.sort((a, b) => parseInt(a.stdNo) - parseInt(b.stdNo))
                                        .map((member) => {
                                            const attendance = studyTime.attendance.find(att => att.stdId === member.stdId);
                                            const isFromSystem = attendanceStatus[member.stdId]?.fromSystem;
                                            return (
                                                <tr 
                                                    key={member.stdId} 
                                                    className={`border-b hover:bg-gray-50 transition-colors duration-200 ${
                                                        changes[member.stdId] ? 'bg-yellow-50' : ''
                                                    } ${
                                                        isFromSystem && !changes[member.stdId] ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <td className="px-3 py-4 whitespace-nowrap font-medium text-text-color">{member.stdNo}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-text-color-alt">{member.stdId}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap">
                                                        {formatTitle(member.student.title)} {member.student.fName} {member.student.lName}
                                                        {isFromSystem && !changes[member.stdId] && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                บันทึกจากระบบ
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <div className="flex flex-wrap gap-1 md:gap-2">
                                                            {statusOptions.map(option => (
                                                                <label 
                                                                    key={option.value}
                                                                    className={`
                                                                        relative flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full border-2 
                                                                        transition-all duration-200 cursor-pointer select-none text-xs md:text-sm
                                                                        ${attendanceStatus[member.stdId]?.status === option.value 
                                                                            ? `${option.color} ${option.borderColor} shadow-sm` 
                                                                            : 'bg-white border-gray-200 hover:border-gray-300'}
                                                                        ${option.hoverColor}
                                                                    `}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`status-${member.stdId}`}
                                                                        value={option.value}
                                                                        checked={attendanceStatus[member.stdId]?.status === option.value}
                                                                        onChange={() => handleStatusChange(member.stdId, option.value)}
                                                                        className="absolute opacity-0"
                                                                    />
                                                                    <div className="flex items-center whitespace-nowrap">
                                                                        <div className={`
                                                                            w-2.5 h-2.5 rounded-full mr-1 border
                                                                            ${attendanceStatus[member.stdId]?.status === option.value 
                                                                                ? 'bg-white border-gray-600' 
                                                                                : 'bg-gray-200 border-gray-300'}
                                                                        `}></div>
                                                                        <span className="font-medium">
                                                                            {option.label}
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <input
                                                            type="text"
                                                            value={notes[member.stdId] || ''}
                                                            onChange={(e) => handleNoteChange(member.stdId, e.target.value)}
                                                            placeholder="เพิ่มหมายเหตุ..."
                                                            className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-4 text-center whitespace-nowrap">
                                                        <div className="text-xs text-text-color-alt space-y-2">
                                                            {changes[member.stdId] && attendanceStatus[member.stdId]?.attId && (
                                                                <button
                                                                    onClick={() => handleReset(member.stdId)}
                                                                    className="text-blue-500 hover:text-blue-700 hover:underline inline-flex items-center"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                    </svg>
                                                                    ยกเลิกการแก้ไข
                                                                </button>
                                                            )}
                                                            {attendanceStatus[member.stdId]?.method && (
                                                                <div className="bg-gray-100 px-2 py-1 rounded-md text-center">
                                                                    <div className="font-medium">{attendanceStatus[member.stdId].method}</div>
                                                                    <div className="text-text-color-alt">
                                                                        {new Date(attendanceStatus[member.stdId].timestamp).toLocaleTimeString('th-TH')}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                            
                            {filteredStudents && filteredStudents.length === 0 && (
                                <div className="text-center py-8 text-text-color-alt">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-lg font-medium">ไม่พบนักเรียนที่ตรงกับการค้นหา</p>
                                    <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือลบการค้นหา</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-line">
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text-color border border-line rounded-lg transition-colors flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={isSaving || Object.keys(changes).length === 0}
                                    className={`px-4 py-2 bg-primary hover:bg-accent text-white rounded-lg transition-colors flex items-center
                                        ${(isSaving || Object.keys(changes).length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            บันทึกการเข้าเรียน {Object.keys(changes).length > 0 && `(${Object.keys(changes).length})`}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
}

export default Attendance;