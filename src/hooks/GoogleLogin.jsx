import { useEffect } from "react";
import axios from "axios";
import { HOSTNAME } from "../config";
import cookie from "cookiejs";
import { userStore } from "../store";

function DisplayErrorMessage(message) {
    return (
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
            <p>{message}</p>
            <span>หากนักเรียนมั่นใจว่าเป็นบัญชีของนักเรียนสามารถติดต่อ ผู้ดูแลระบบได้</span>
        </div>
    );
}

const GoogleLoginButton = ({studentId}) => {
    const { setUser } = userStore((state) => state);
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "322980685602-k0k05du2q7e8tto4i9lutat9b6crk49h.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login"),
      { theme: "outline", size: "large", width: "100%" } // customization attributes
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    const token = response.credential;
    try {
      const res = await axios.post(`${HOSTNAME}/auth/s/google`, { token, studentId });
      if (res.status == 200) {
        console.log(res.data)
          cookie.set("accessToken", res.data.jwtToken, { secure: true, expires: 1 });
            cookie.set("refreshToken", res.data.refreshToken, { secure: true, expires: 24 * 60 * 60 });
            setUser(res.data);
            window.location.href = "/dashboard";
      }else if (res.status == 401) {
        alert("บัญชีนี้ไม่สามารถเข้าสู่ระบบได้ โปรดใช้บัญชีที่ลงทะเบียนไว้ครั้งแรกเท่านั้น");
      } else {
        <DisplayErrorMessage message="เกิดข้อผิดพลาดในการเข้าสู่ระบบ" />;
      }
    } catch (err) {
        alert("บัญชีนี้ไม่สามารถเข้าสู่ระบบได้ โปรดใช้บัญชีที่ลงทะเบียนไว้ครั้งแรกเท่านั้น");
    }
  };

  return <div id="google-login"></div>;
};

export default GoogleLoginButton;
