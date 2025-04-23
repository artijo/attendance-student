import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { useNavigate } from "react-router";

function CreateLeaveRequest() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    leaveDate: DateTime.now().toISODate(),
    leaveReason: "",
    leaveFile: null,
    selectedStudyTimes: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState(null);
  const [error, setError] = useState("");
  const [availableStudyTimes, setAvailableStudyTimes] = useState([]);

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
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-primary"
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
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-color mb-1">
              ประเภทการลา <span className="text-red-500">*</span>
            </label>
            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              className="w-full rounded-lg border-line p-2 focus:ring-2 focus:ring-primary focus:border-primary"
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
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-color mb-1">
              วันที่ลา <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="leaveDate"
              value={formData.leaveDate}
              onChange={handleChange}
              className="w-full rounded-lg border-line p-2 focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-color mb-1">
              คาบเรียนที่ลา <span className="text-red-500">*</span>
            </label>
            {availableStudyTimes.length === 0 ? (
              <p className="text-sm text-gray-500 p-2 border border-gray-200 rounded-lg bg-gray-50">
                ไม่พบข้อมูลคาบเรียนในวันที่เลือก
              </p>
            ) : (
              <div className="border border-line rounded-lg overflow-hidden">
                {availableStudyTimes.map(studyTime => {
                  const isSelected = formData.selectedStudyTimes.includes(studyTime.studyTimeId);
                  const subject = studyTime.timetable?.subject || {};
                  return (
                    <div 
                      key={studyTime.studyTimeId}
                      className={`p-3 flex items-center border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-primary' : ''
                      }`}
                      onClick={() => handleStudyTimeChange(studyTime.studyTimeId)}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className={`font-medium ${isSelected ? 'text-white' : ''}`}>
                            {subject.subNameThai || "รายวิชา"}
                          </span>
                          <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                            {formatTime(studyTime.timetable?.timeStart)} - {formatTime(studyTime.timetable?.timeEnd)}
                          </span>
                        </div>
                        <div className={`text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                          <span>{subject.subCode || ""}</span>
                          {subject.subNameEng && 
                            <span className={`ml-2 ${isSelected ? 'text-white opacity-90' : 'text-gray-500'}`}>
                              ({subject.subNameEng})
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-text-color-alt mt-1">
              เลือกคาบเรียนที่ต้องการลา (สามารถเลือกได้มากกว่า 1 คาบ)
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-color mb-1">
              เหตุผลในการลา <span className="text-red-500">*</span>
            </label>
            <textarea
              name="leaveReason"
              value={formData.leaveReason}
              onChange={handleChange}
              className="w-full rounded-lg border-line p-2 focus:ring-2 focus:ring-primary focus:border-primary min-h-[150px]"
              placeholder="ระบุเหตุผลในการลา เช่น มีอาการป่วย มีธุระสำคัญ ฯลฯ"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-color mb-1">
              แนบไฟล์ (ถ้ามี)
            </label>
            <input
              type="file"
              name="leaveFile"
              onChange={handleFileChange}
              className="w-full text-sm p-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={isSubmitting}
            />
            <p className="text-xs text-text-color-alt mt-1">
              รองรับไฟล์ PDF, JPG, PNG (ไม่เกิน 5MB)
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/leavereq")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-text-color hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors flex items-center"
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
                "ส่งคำร้อง"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLeaveRequest;