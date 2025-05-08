import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { useNavigate } from "react-router";
import { userStore } from "../../store";

function CreateLeaveRequest() {
  const navigate = useNavigate();
  const user = userStore((state) => state.user);
  console.log("User data:", user);
  
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    leaveDate: DateTime.now().toISODate(),
    leaveReason: "",
    leaveFile: null,
    selectedStudyTimes: [],
    tel: user?.tel || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState(null);
  const [error, setError] = useState("");
  const [availableStudyTimes, setAvailableStudyTimes] = useState([]);
  const [studentData, setStudentData] = useState(null);

  async function fetchLeaveTypes() {
    try {
      const response = await axios.get(`${HOSTNAME}/s/leavetype`);
      setLeaveType(response.data || []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      setError("ไม่สามารถโหลดประเภทการลาได้");
    }
  }

  async function getStudingTime(date) {
    try {
      const response = await axios.get(`${HOSTNAME}/s/studingTime/${date}`);
      const studyTimes = response.data || [];
      // Sort study times by timeStart
      const sortedStudyTimes = [...studyTimes].sort((a, b) => {
        return a.timetable?.timeStart?.localeCompare(b.timetable?.timeStart);
      });
      setAvailableStudyTimes(sortedStudyTimes);
      return sortedStudyTimes;
    } catch (error) {
      console.error("Error fetching studying time:", error);
      setError("ไม่สามารถโหลดข้อมูลเวลาที่เรียนได้");
      setAvailableStudyTimes([]);
      return [];
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, leaveFile: e.target.files[0] || null }));
  };

  const handleStudyTimeChange = (studyTimeId) => {
    setFormData(prev => {
      const isSelected = prev.selectedStudyTimes.includes(studyTimeId);
      let updatedTimes;
      
      if (isSelected) {
        updatedTimes = prev.selectedStudyTimes.filter(id => id !== studyTimeId);
      } else {
        updatedTimes = [...prev.selectedStudyTimes, studyTimeId];
      }
      
      return { ...prev, selectedStudyTimes: updatedTimes };
    });
  };

  const validateForm = () => {
    if (!formData.leaveTypeId) {
      setError("กรุณาเลือกประเภทการลา");
      return false;
    }
    
    if (!formData.leaveDate) {
      setError("กรุณาเลือกวันที่ลา");
      return false;
    }
    
    if (!formData.leaveReason.trim()) {
      setError("กรุณากรอกเหตุผลในการลา");
      return false;
    }
    
    if (!formData.tel.trim()) {
      setError("กรุณากรอกเบอร์โทรศัพท์ที่สามารถติดต่อได้");
      return false;
    }
    
    if (formData.selectedStudyTimes.length === 0) {
      setError("กรุณาเลือกอย่างน้อยหนึ่งคาบเรียนที่ต้องการลา");
      return false;
    }
    
    // Check file size if a file is selected (max 5MB)
    if (formData.leaveFile && formData.leaveFile.size > 5 * 1024 * 1024) {
      setError("ไฟล์ที่แนบมีขนาดใหญ่เกินไป (สูงสุด 5MB)");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data for file upload
      const submitData = new FormData();
      submitData.append("leaveTypeId", formData.leaveTypeId);
      submitData.append("leaveDate", formData.leaveDate);
      submitData.append("leaveReason", formData.leaveReason);
      submitData.append("tel", formData.tel);
      
      // Append each study time ID
      formData.selectedStudyTimes.forEach(studyTimeId => {
        submitData.append("studyTimeIds[]", studyTimeId);
      });
      
      if (formData.leaveFile) {
        submitData.append("leaveFile", formData.leaveFile);
      }

      console.log("Submitting leave request with data:", submitData.entries());
      
      await axios.post(`${HOSTNAME}/s/leave`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      navigate("/leavereq");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งคำร้องขอลา กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    getStudingTime(formData.leaveDate);
  }, [formData.leaveDate]);

  // Format time for display (from HH:MM:SS to HH:MM)
  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : "";
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/leavereq")}
          className="mr-4 p-2.5 hover:bg-gray-100 rounded-full transition-colors group"
          aria-label="กลับไปหน้ารายการคำร้องขอลา"
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
        </button>
        <h1 className="text-2xl font-bold text-primary">ส่งคำร้องขอลา</h1>
      </div>

      <div className="bg-white rounded-lg border border-line shadow-sm p-6 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-line mb-6">
              <h2 className="font-medium text-primary mb-3 text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                ข้อมูลการลา
              </h2>
          
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-color mb-2 flex items-center">
                    ประเภทการลา
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="leaveTypeId"
                    value={formData.leaveTypeId}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${error && !formData.leaveTypeId ? 'border-red-400 ring-1 ring-red-400' : 'border-line'} p-2.5 transition-colors focus:ring-2 focus:ring-primary focus:border-primary`}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">เลือกประเภทการลา</option>
                    {leaveType && leaveType.map((type) => (
                      <option key={type.leaveTypeId} value={type.leaveTypeId}>
                        {type.leaveTypeName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-color mb-2 flex items-center">
                    วันที่ลา
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="leaveDate"
                    value={formData.leaveDate}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${error && !formData.leaveDate ? 'border-red-400 ring-1 ring-red-400' : 'border-line'} p-2.5 transition-colors focus:ring-2 focus:ring-primary focus:border-primary`}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-text-color-alt" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    เบอร์โทรศัพท์
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${error && !formData.tel ? 'border-red-400 ring-1 ring-red-400' : 'border-line'} p-2.5 transition-colors focus:ring-2 focus:ring-primary focus:border-primary`}
                    placeholder="เบอร์โทรศัพท์ที่สามารถติดต่อได้"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-text-color-alt" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                คาบเรียนที่ลา
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              {availableStudyTimes.length === 0 ? (
                <div className="text-sm text-text-color-alt p-6 border border-dashed border-line rounded-lg bg-gray-50 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ไม่พบข้อมูลคาบเรียนในวันที่เลือก
                </div>
              ) : (
                <div className={`border rounded-lg overflow-hidden transition-all ${error && formData.selectedStudyTimes.length === 0 ? 'border-red-400 ring-1 ring-red-400' : 'border-line'}`}>
                  {availableStudyTimes.map(studyTime => {
                    const isSelected = formData.selectedStudyTimes.includes(studyTime.studyTimeId);
                    const subject = studyTime.timetable?.subject || {};
                    return (
                      <div 
                        key={studyTime.studyTimeId}
                        className={`relative p-4 flex items-center border-b last:border-b-0 cursor-pointer 
                          transition-all duration-200 hover:bg-gray-50
                          ${isSelected ? 'bg-primary/10 bg-opacity-10' : ''}`}
                        onClick={() => handleStudyTimeChange(studyTime.studyTimeId)}
                      >
                        <div className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center mr-3 transition-colors
                          ${isSelected 
                            ? 'bg-primary border-primary text-white' 
                            : 'border-gray-300 bg-white'}`}
                        >
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between flex-wrap gap-2">
                            <span className={`font-medium ${isSelected ? 'text-primary' : 'text-text-color'}`}>
                              {subject.subNameThai || "รายวิชา"}
                            </span>
                            <span className={`text-sm ${isSelected ? 'text-primary' : 'text-text-color-alt'}`}>
                              {formatTime(studyTime.timetable?.timeStart)} - {formatTime(studyTime.timetable?.timeEnd)} น.
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <span className="text-sm text-text-color-alt">{subject.subCode || ""}</span>
                            {subject.subNameEng && 
                              <span className="text-sm text-text-color-alt">
                                {subject.subNameEng}
                              </span>
                            }
                            {subject.teacher && 
                              <span className="text-sm text-text-color-alt">
                                อาจารย์: {subject.teacher.fName} {subject.teacher.lName}
                              </span>
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-text-color-alt mt-1 ml-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                เลือกคาบเรียนที่ต้องการลา (สามารถเลือกได้มากกว่า 1 คาบ)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-color mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-text-color-alt" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                เหตุผลในการลา
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="leaveReason"
                value={formData.leaveReason}
                onChange={handleChange}
                className={`w-full rounded-lg border ${error && !formData.leaveReason.trim() ? 'border-red-400 ring-1 ring-red-400' : 'border-line'} p-3 transition-colors focus:ring-2 focus:ring-primary focus:border-primary min-h-[150px]`}
                placeholder="ระบุเหตุผลในการลา เช่น มีอาการป่วย มีธุระสำคัญ ฯลฯ"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-color mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-text-color-alt" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 102 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                </svg>
                แนบไฟล์ (ถ้ามี)
              </label>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-32 rounded-lg cursor-pointer 
                  border-2 border-dashed border-line hover:bg-gray-50 transition-colors ${formData.leaveFile ? 'bg-primary bg-opacity-5' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {formData.leaveFile ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-text-color font-medium">{formData.leaveFile.name}</p>
                        <p className="text-xs text-text-color-alt">
                          {(formData.leaveFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-text-color-alt mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-text-color-alt">
                          <span className="font-medium">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวาง
                        </p>
                        <p className="text-xs text-text-color-alt">
                          รองรับไฟล์ PDF, JPG, PNG (ไม่เกิน 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    name="leaveFile"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/leavereq")}
                className="px-5 py-2.5 border border-line rounded-lg text-text-color hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-accent transition-colors shadow-sm hover:shadow flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ส่งคำร้อง
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLeaveRequest;