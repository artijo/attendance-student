import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { DateTime } from "luxon";

function ActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0
  });
  const [userClassrooms, setUserClassrooms] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [userClassroomStats, setUserClassroomStats] = useState({
    total: 0,
    present: 0,
    absent: 0
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    // Fetch user's classrooms where they are a leader
    const fetchUserClassrooms = async () => {
      try {
        const response = await axios.get(`${HOSTNAME}/s/leader/classrooms`);
        setUserClassrooms(response.data || []);
      } catch (err) {
        console.error('Error fetching user classrooms:', err);
      }
    };
    
    fetchUserClassrooms();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${HOSTNAME}/s/leader/activity/${id}`);
        setActivity(response.data);
        
        // Calculate stats
        const todayParticipations = getTodayParticipation(response.data.actParticipate);
        
        // Count students from all classrooms
        let totalStudents = 0;
        if (response.data.classroom && response.data.classroom.length > 0) {
          totalStudents = response.data.classroom.reduce((total, c) => {
            return total + (c.classroom?.classroomMembers?.length || 0);
          }, 0);
        } else if (response.data.joinLimitNumber) {
          totalStudents = response.data.joinLimitNumber;
        }
          
        setStats({
          total: totalStudents || 0,
          present: todayParticipations.length,
          absent: totalStudents ? totalStudents - todayParticipations.length : 0
        });
      } catch (err) {
        setError(err.response?.data?.message || "ไม่สามารถดึงข้อมูลกิจกรรมได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivity();
  }, [id]);

  useEffect(() => {
    // Filter participants and calculate statistics for user's classroom only
    if (activity && userClassrooms.length > 0) {
      // Get the IDs of classrooms where the user is a leader
      const userClassIds = userClassrooms.map(classroom => classroom.classId);
      
      // Filter participants to only include those from the user's classrooms
      const participantsFromUserClass = activity.actParticipate?.filter(participant => {
        // Check if any of the student's classrooms match user's leader classrooms
        return participant.student?.classroomMembers?.some(membership => 
          userClassIds.includes(membership.classId)
        );
      }) || [];
      
      setFilteredParticipants(participantsFromUserClass);
      
      // Calculate total students in user's classrooms that can join this activity
      let totalStudentsInUserClassrooms = 0;
      let userClassroomsInActivity = [];
      
      // Find which of user's classrooms are allowed in this activity
      if (activity.classroom && activity.classroom.length > 0) {
        userClassroomsInActivity = activity.classroom.filter(activityClass => 
          userClassIds.includes(activityClass.classId)
        );
        
        // Count students in these classrooms
        totalStudentsInUserClassrooms = userClassroomsInActivity.reduce((total, c) => {
          return total + (c.classroom?.classroomMembers?.length || 0);
        }, 0);
      }
      
      // Filter today's participations for user's classrooms
      const todayParticipations = getTodayParticipation(participantsFromUserClass);
      
      // Set stats for user's classroom
      setUserClassroomStats({
        total: totalStudentsInUserClassrooms,
        present: todayParticipations.length,
        absent: totalStudentsInUserClassrooms ? totalStudentsInUserClassrooms - todayParticipations.length : 0
      });
    }
  }, [activity, userClassrooms]);

  // Calculate available dates for multi-day activities
  useEffect(() => {
    if (activity && activity.actDate) {
      const dates = [];
      const startDate = DateTime.fromISO(activity.actDate).setZone(TIME_ZONE);
      const endDate = activity.actDateEnd ? 
        DateTime.fromISO(activity.actDateEnd).setZone(TIME_ZONE) : 
        startDate;
      
      // Default to today's date if within activity period, otherwise use start date
      const today = DateTime.now().setZone(TIME_ZONE).startOf('day');
      const isWithinPeriod = today >= startDate.startOf('day') && today <= endDate.startOf('day');
      
      let current = startDate.startOf('day');
      const defaultDate = isWithinPeriod ? today : startDate.startOf('day');
      
      // Generate list of all dates between start and end
      while (current <= endDate) {
        dates.push(current);
        current = current.plus({ days: 1 });
      }
      
      setAvailableDates(dates);
      setSelectedDate(defaultDate);
    }
  }, [activity]);

  // Filter participants by selected date and user's classroom
  useEffect(() => {
    if (activity && userClassrooms.length > 0 && selectedDate) {
      // Get the IDs of classrooms where the user is a leader
      const userClassIds = userClassrooms.map(classroom => classroom.classId);
      
      // Filter participants by date and classroom
      const participantsFromUserClass = activity.actParticipate?.filter(participant => {
        // Filter by user's classrooms
        const isFromUserClass = participant.student?.classroomMembers?.some(membership => 
          userClassIds.includes(membership.classId)
        );
        
        // Filter by selected date
        const participationDate = DateTime.fromISO(participant.joinTimestamp)
          .setZone(TIME_ZONE)
          .startOf('day');
        const isSelectedDate = participationDate.equals(selectedDate);
        
        return isFromUserClass && isSelectedDate;
      }) || [];
      
      setFilteredParticipants(participantsFromUserClass);
      
      // Calculate statistics for user's classroom on selected date
      let totalStudentsInUserClassrooms = 0;
      
      // Find which of user's classrooms are allowed in this activity
      if (activity.classroom && activity.classroom.length > 0) {
        const userClassroomsInActivity = activity.classroom.filter(activityClass => 
          userClassIds.includes(activityClass.classId)
        );
        
        // Count students in these classrooms
        totalStudentsInUserClassrooms = userClassroomsInActivity.reduce((total, c) => {
          return total + (c.classroom?.classroomMembers?.length || 0);
        }, 0);
      }
      
      // Set stats for user's classroom on selected date
      setUserClassroomStats({
        total: totalStudentsInUserClassrooms,
        present: participantsFromUserClass.length,
        absent: totalStudentsInUserClassrooms ? totalStudentsInUserClassrooms - participantsFromUserClass.length : 0
      });
    }
  }, [activity, userClassrooms, selectedDate]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const thaiYear = date.getFullYear() + 543;
    return `${day}/${month}/${thaiYear}`;
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
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

  // Find if this activity allows user's classroom to join
  const getUserClassId = () => {
    if (!userClassrooms.length || !activity || !activity.classroom) return null;
    
    // Check if any of the user's classrooms can join this activity
    const userClassId = userClassrooms.find(userClass => 
      activity.classroom.some(activityClass => 
        activityClass.classId === userClass.classId
      )
    )?.classId;
    
    return userClassId || userClassrooms[0]?.classId;
  };

  // Get user classroom information for display purposes
  const getUserClassroomInfo = () => {
    if (!userClassrooms.length) return null;
    
    const classId = getUserClassId();
    if (!classId) return null;
    
    const userClass = userClassrooms.find(c => c.classId === classId);
    if (!userClass) return null;
    
    return {
      id: userClass.classId,
      level: userClass.classLevel,
      room: userClass.classRoom,
      type: userClass.classroomType?.classTypeNameThai
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <Link to="/leader/activities" className="text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          กลับไปหน้ารายการกิจกรรม
        </Link>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-yellow-50 p-6 rounded-lg text-yellow-700 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold mb-2">ไม่พบข้อมูลกิจกรรม</h3>
          <p className="mb-4">กิจกรรมที่คุณต้องการดูอาจถูกลบไปแล้วหรือไม่มีอยู่ในระบบ</p>
          <Link to="/leader/activities" className="text-primary hover:underline">
            กลับไปหน้ารายการกิจกรรม
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Link
          to="/leader/activities"
          className="mr-4 p-2.5 hover:bg-gray-100 rounded-full transition-colors group"
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
        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">รายละเอียดกิจกรรม</h1>
      </div>

      {/* Activity Information Card */}
      <div className="bg-white rounded-xl shadow-md border border-line p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-primary font-heading">{activity?.actName}</h2>
          {activity?.actDesc && (
            <p className="mt-2 text-text-color-alt">{activity.actDesc}</p>
          )}
          <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body mt-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-text-color-alt mb-1">วันที่จัดกิจกรรม</p>
                <p className="text-base font-medium">
                  {formatDate(activity?.actDate)}
                  {activity?.actDateEnd && activity?.actDate !== activity?.actDateEnd && (
                    <span> - {formatDate(activity.actDateEnd)}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-text-color-alt mb-1">เวลา</p>
                <p className="text-base font-medium">
                  {formatTime(activity?.actStartTime)} - {formatTime(activity?.actEndTime)} น.
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-text-color-alt mb-1">สถานที่</p>
                <p className="text-base font-medium">
                  {activity?.actLocation || "ไม่ระบุสถานที่"}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-text-color-alt mb-1">ประเภทกิจกรรม</p>
                <p className="text-base font-medium">
                  {activity?.activityType?.actTypeName || "ไม่ระบุประเภท"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {activity?.teacher && activity.teacher.length > 0 && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <div>
                  <p className="text-sm text-text-color-alt mb-1">อาจารย์ผู้ดูแล</p>
                  <div className="space-y-1">
                    {activity.teacher.map(t => (
                      <p key={t.actTeacherId} className="text-base font-medium">
                        อาจารย์ {t.teacher?.fName} {t.teacher?.lName}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activity?.actStatus && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-text-color-alt mb-1">สถานะกิจกรรม</p>
                  <p className="text-base font-medium">
                    {activity.actStatus === "PROCESSING" ? "กำลังดำเนินการ" : 
                     activity.actStatus === "COMPLETED" ? "เสร็จสิ้น" : 
                     activity.actStatus === "CANCELLED" ? "ยกเลิก" : 
                     activity.actStatus}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <div>
                <p className="text-sm text-text-color-alt mb-1">การจำกัดการเข้าร่วม</p>
                <p className="text-base font-medium">
                  {activity?.joinLimit ? (
                    activity?.classroom && activity.classroom.length > 0 ? (
                      <>ห้องเรียนที่กำหนด ({activity.classroom.length} ห้อง)</>
                    ) : (
                      <>จำนวน {activity?.joinLimitNumber || "-"} คน</>
                    )
                  ) : (
                    "ไม่จำกัดการเข้าร่วม"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector for multi-day activities */}
      {availableDates.length > 1 && (
        <div className="bg-white rounded-xl shadow-md border border-line p-4 mb-6">
          <h3 className="font-bold text-primary mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            เลือกวันที่ต้องการดูข้อมูล
          </h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {availableDates.map((date, index) => {
              const isSelected = selectedDate && date.equals(selectedDate);
              const isToday = date.equals(DateTime.now().setZone(TIME_ZONE).startOf('day'));
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSelected 
                      ? 'bg-primary text-white' 
                      : isToday
                        ? 'bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {formatDate(date.toISO())}
                  {isToday && <span className="ml-1 text-xs">(วันนี้)</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Statistics Card - Only for User's Classroom */}
      <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden mb-6">
        <div className="border-b border-line p-6">
          <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            สถิติการเข้าร่วมกิจกรรม
            {getUserClassroomInfo() && (
              <span className="ml-2 text-base font-normal text-gray-600">
                (ม.{getUserClassroomInfo().level}/{getUserClassroomInfo().room})
              </span>
            )}
            {selectedDate && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                วันที่ {formatDate(selectedDate.toISO())}
              </span>
            )}
          </h2>
          <p className="text-text-color-alt text-sm">สถิติการเข้าร่วมกิจกรรมของห้องเรียนคุณ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="bg-gray-50 rounded-lg p-5">
            <p className="text-sm text-text-color-alt mb-1">จำนวนผู้เข้าร่วมทั้งหมด</p>
            <p className="text-3xl font-bold text-primary">{userClassroomStats.total}</p>
            <p className="text-sm text-text-color-alt mt-1">คน</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-5">
            <p className="text-sm text-green-600 mb-1">เข้าร่วม</p>
            <p className="text-3xl font-bold text-green-600">{userClassroomStats.present}</p>
            <p className="text-sm text-green-500 mt-1">คน</p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-5">
            <p className="text-sm text-red-600 mb-1">ไม่ได้เข้าร่วม</p>
            <p className="text-3xl font-bold text-red-600">{userClassroomStats.absent}</p>
            <p className="text-sm text-red-500 mt-1">คน</p>
          </div>
        </div>
      </div>
      
      {/* Activity Classrooms Card (if applicable) */}
      {activity?.classroom && activity.classroom.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden mb-6">
          <div className="border-b border-line p-6">
            <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              ห้องเรียนที่เข้าร่วม
            </h2>
            <p className="text-text-color-alt text-sm">ห้องเรียนที่สามารถเข้าร่วมกิจกรรมนี้ได้</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activity.classroom.map((classItem) => (
                <div key={classItem.classCanjoinId} className="bg-gray-50 p-3 rounded-lg border border-line">
                  <h3 className="font-bold text-gray-800 text-lg">
                    ม.{classItem.classroom?.classLevel}/{classItem.classroom?.classRoom}
                  </h3>
                  {classItem.classroom?.classroomMembers && (
                    <p className="text-sm text-text-color-alt">
                      นักเรียน {classItem.classroom.classroomMembers.length} คน
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Activity Participants Card - Only from User's Classroom */}
      {activity && (
        <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden mb-6">
          <div className="border-b border-line p-6">
            <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              ผู้เข้าร่วมกิจกรรมในห้องของคุณ
              {getUserClassroomInfo() && (
                <span className="ml-2 text-base font-normal text-gray-600">
                  (ม.{getUserClassroomInfo().level}/{getUserClassroomInfo().room})
                </span>
              )}
              {selectedDate && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  วันที่ {formatDate(selectedDate.toISO())}
                </span>
              )}
            </h2>
            <p className="text-text-color-alt text-sm">
              รายชื่อนักเรียนในห้องเรียนของคุณที่เข้าร่วมกิจกรรมในวันที่เลือก
            </p>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              {filteredParticipants.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เลขที่
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รหัสนักเรียน
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อ-นามสกุล
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาที่เข้าร่วม
                      </th>
                      {/* Add note column if exists */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หมายเหตุ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredParticipants.map((participant) => {
                      // Find student's classroom information to get the student number (เลขที่)
                      const classroomMember = participant.student?.classroomMembers?.find(
                        member => member.classId === getUserClassId()
                      );
                      
                      // Helper function for title display
                      const getTitleDisplay = (title) => {
                        switch(title) {
                          case 'MR': return 'นาย';
                          case 'MS': return 'นางสาว';
                          case 'BOY': return 'เด็กชาย';
                          case 'GIRL': return 'เด็กหญิง';
                          default: return title || '';
                        }
                      };
                      
                      return (
                        <tr key={participant.actParticipateId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {classroomMember?.stdNo || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {participant.stdId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {getTitleDisplay(participant.student?.title)} {participant.student?.fName} {participant.student?.lName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(participant.joinTimestamp).toLocaleString('th-TH')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {participant.note || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>ไม่พบนักเรียนห้องของคุณเข้าร่วมกิจกรรมในวันที่เลือก</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Only show the overall participant list if the user has no classrooms or if there are no participants from user's classroom */}
      {(userClassrooms.length === 0 || filteredParticipants.length === 0) && activity?.actParticipate && activity.actParticipate.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden mb-6">
          <div className="border-b border-line p-6">
            <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              ผู้เข้าร่วมกิจกรรมทั้งหมด
            </h2>
            <p className="text-text-color-alt text-sm">รายชื่อนักเรียนทุกห้องที่เข้าร่วมกิจกรรมแล้ว</p>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัสนักเรียน
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อ-นามสกุล
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ห้องเรียน
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เวลาที่เข้าร่วม
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activity.actParticipate.map((participant) => {
                    // Find participant's classroom
                    const classroom = participant.student?.classroomMembers?.[0]?.classroom;
                    
                    return (
                      <tr key={participant.actParticipateId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.stdId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.student?.title} {participant.student?.fName} {participant.student?.lName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {classroom ? `ม.${classroom.classLevel}/${classroom.classRoom}` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(participant.joinTimestamp).toLocaleString('th-TH')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Button */}
      <div className="flex justify-end">
        <Link
          to={`/leader/checkin/${activity?.actId}?classId=${getUserClassId() || ''}`}
          className={`px-8 py-3 ${!getUserClassId() ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-secondary/90'} text-white rounded-md transition-colors shadow-sm flex items-center gap-2`}
          onClick={(e) => {
            if (!getUserClassId()) {
              e.preventDefault();
              alert('คุณไม่สามารถเช็คชื่อกิจกรรมนี้ได้ เนื่องจากห้องเรียนของคุณไม่ได้ถูกกำหนดให้เข้าร่วมกิจกรรมนี้');
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          ไปยังหน้าเช็คชื่อ
        </Link>
      </div>
    </div>
  );
}

export default ActivityDetail;