import axios from "axios";
import { HOSTNAME } from "../config";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { validateStudentId } from "../../validator";
import { userStore } from "../store";
import GoogleLoginButton from "../hooks/GoogleLogin";
import cookie from "cookiejs";

function Login() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIdInput, setShowIdInput] = useState(true);
  const setUser = userStore((state) => state.setUser);

  const checkStudentId = async () => {
    if (!validateStudentId(studentId)) {
      setError("กรุณากรอกรหัสนักเรียนให้ถูกต้อง");
      return false;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.get(`${HOSTNAME}/auth/s/check/${studentId}`);
      setStudent(res.data);
      setShowIdInput(false);
      setError("");
      setIsLoading(false);
      return true;
    } catch (err) {
      console.log(err);
      setError("ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบรหัสนักเรียน");
      setIsLoading(false);
      return false;
    }
  };

  
  // Handle Enter key on student ID input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      checkStudentId();
    }
  };
  
  // Reset to ID input
  const handleBack = () => {
    setShowIdInput(true);
    setStudent(null);
  };

  useEffect(() => {
    console.log(cookie.get("accessToken"));

  }, []);


  return (
    <div className="w-full h-[96dvh] flex flex-col gap-2 justify-center items-center bg-background">
      <div className="shadow-xl p-10 md:p-16 rounded-xl bg-white border border-line-alt max-w-md w-full transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-center text-2xl md:text-3xl font-bold text-primary font-heading">เข้าสู่ระบบ • สำหรับนักเรียน</h1>
          <div className="mt-2 h-1 w-16 bg-secondary mx-auto rounded-full"></div>
        </div>
        
        <div className="mt-6 space-y-5 font-body">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {typeof error === 'object' ? (error.email || error.password || "เกิดข้อผิดพลาด") : error}
              </p>
            </div>
          )}
          
          {showIdInput ? (
            <div className="space-y-2">
              <label htmlFor="studentId" className="block text-sm font-medium text-text-color">
                รหัสนักเรียน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="studentId"
                  placeholder="รหัสนักเรียน"
                  className="pl-10 mt-1 block w-full h-12 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  type="button" 
                  className="w-full py-3 px-5 text-sm font-medium text-white bg-primary hover:bg-accent rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 flex items-center justify-center"
                  onClick={checkStudentId}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      ตรวจสอบรหัสนักเรียน
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-lg border border-line">
                <h3 className="font-medium text-text-color">ข้อมูลนักเรียน</h3>
                <p className="mt-1 text-sm text-text-color-alt">{student?.studentName} [{studentId}]</p>
              </div>
              
              <div className="space-y-3">
                {/* Show appropriate login options based on student account status */}
                {!student?.googleId && !student?.lineId && (
                  <p className="text-sm text-text-color-alt">กรุณาเลือกวิธีการเข้าสู่ระบบที่ต้องการ</p>
                )}
                
                {/* Google login option */}
                {/* <button
                  type="button"
                  className="w-full py-3 px-5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 flex items-center justify-center"
                  onClick={() => handleSocialAuth('google')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {student?.googleId ? "เข้าสู่ระบบด้วย Google" : "ดำเนินการต่อด้วย Google"}
                </button> */}
                <GoogleLoginButton studentId={studentId} />
                <p className="text-xs text-center text-blue-600 mt-1 italic">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  แนะนำให้ใช้บัญชี Google ของโรงเรียน (@nps.ac.th)
                </p>
                
                {/* Line login option */}
                {/* <button
                  type="button"
                  className="w-full py-3 px-5 text-sm font-medium text-white bg-[#00B900] hover:bg-[#00a000] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#00B900]/30 transition-all duration-300 flex items-center justify-center"
                  onClick={() => handleSocialAuth('line')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .345-.281.63-.63.63h-2.386c-.345 0-.627-.285-.627-.63V10.124c0-.346.282-.63.63-.63h2.386zm-10.466 0c.345 0 .63.285.63.631v3.14c0 .345-.285.63-.63.63-.344 0-.63-.285-.63-.63v-3.14c0-.346.286-.63.63-.63zm-2.092 0c.343 0 .629.285.629.631v3.14c0 .345-.286.63-.629.63-.346 0-.631-.285-.631-.63V12.61H3.734v1.156c0 .345-.282.63-.631.63-.345 0-.63-.285-.63-.63v-3.14c0-.346.285-.63.63-.63h4.034zm12.564 0c.351 0 .631.285.631.631v3.14c0 .345-.28.63-.631.63-.345 0-.627-.285-.627-.63v-3.14c0-.346.282-.63.627-.63zm-5.031.001c.28 0 .481.22.481.5v3.2c0 .28-.2.5-.481.5-.28 0-.48-.22-.48-.5v-.5h-2.003v.5c0 .28-.201.5-.48.5-.28 0-.482-.22-.482-.5v-3.2c0-.28.202-.5.482-.5.279 0 .48.22.48.5v.5h2.002v-.5c0-.28.201-.5.481-.5zM24 10.924C24 16.196 20.2 20 13 20c-7.197 0-13-3.804-13-9.076C0 5.624 5.8 2 13 2c7.204 0 11 3.624 11 8.924z"/>
                  </svg>
                  {student?.lineId ? "เข้าสู่ระบบด้วย Line" : "ดำเนินการต่อด้วย Line"}
                </button> */}
                
                <button
                  type="button"
                  className="w-full py-2 px-5 text-sm font-medium text-text-color-alt hover:text-primary transition-all duration-300 flex items-center justify-center"
                  onClick={handleBack}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  ย้อนกลับ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-text-color-alt text-sm font-body">
        © {new Date().getFullYear()} ระบบบันทึกและติดตามการเข้าเรียนและกิจกรรมของนักเรียน
      </div>
    </div>
  );
}
export default Login;
