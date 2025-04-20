import { Outlet, Link, NavLink } from "react-router";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { HOSTNAME } from "./config";
import Logo from "./assets/nps-logo.webp";
import { userStore } from "./store";
import cookie from "cookiejs";

// config axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Authorization"] = `Bearer ${cookie.get("accessToken")}`;

let isRefreshing = false;

// Add axios interceptor for handling responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = cookie.get("refreshToken");
          const res = await axios.post(
            `${HOSTNAME}/auth/s/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );
          if (res.status === 200) {
            cookie.set("accessToken", res.data.token, { secure: true, expires: 1 });
          }
          isRefreshing = false;
          window.location.reload();
          return;
        } catch (refreshError) {
          isRefreshing = false;
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const User = userStore((state) => state.user);
  const navLinks = [
    { name: "แดชบอร์ด", path: "/dashboard", icon:"home.svg" },
    { name: "ห้องเรียน", path: "/classroom", icon:"classroom.svg" },
    { name: "วิชาที่สอน", path: "/subjects", icon:"subject.svg" },
    { name: "กิจกรรม", path: "/activities", icon:"activity.svg" },
    { name: "คำร้อง", path: "/leavereq", icon: "leave.svg" },
  ];

  function openMenu() {
    setIsMenuOpen(!isMenuOpen);
    document.querySelector("header").classList.toggle("active");
  }
  function closeMenu() {
    setIsMenuOpen(false);
    document.querySelector("header").classList.remove("active");
  }

  const Logout = async () => {
    cookie.remove("accessToken");
    cookie.remove("refreshToken");
    window.location.href = "/login";
  }

  async function refreshTokens() {
    const refreshToken = cookie.get("refreshToken");
    try {
      // refresh token headers['Authorization'] = 'Bearer ' + token;
      const response = await axios.post(
        `${HOSTNAME}/auth/s/refresh`,
        {},  // ข้อมูลที่ต้องการส่งไปใน request body (ถ้ามี)
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          }
        }
      );
      if (response.status === 200) {
        cookie.set("accessToken", response.data.token, { secure: true, expires: 1 });
      } 
      if (response.status !== 200) {
        throw new Error("Cannot refresh token");
      }

  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.reload();
    }
    window.location.href = "/login";
  }
  }


  const checkAuth = async () => {
    try {
      const res = await axios.get(HOSTNAME+"/auth/s/check", { 
        headers: {
          Authorization: `Bearer ${cookie.get("accessToken")}`,
        },
      });
      if (res.status !== 200) {
        refreshTokens();
      }
    } catch (error) {
      refreshTokens();
    }
};



    if (!cookie.get("refreshToken") || !cookie.get("accessToken")) {
      return <Navigate to="/login" />;
    }
    useEffect(() => {
     checkAuth();

    }, []);

  return (
    <>
      <header className="font-heading bg-primary text-white sticky left-0 top-0 md:bottom-0 md:fixed md:w-56 h-[4.5rem] md:h-screen flex flex-col">
        <div className="p-2 md:p-3 text-white flex sm:block justify-between items-center h-auto">
          <div
            id="toggle"
            className="sm:hidden flex items-center rounded-md border-2 my-2 p-2 hover:bg-accent transition-colors duration-300"
            onClick={openMenu}
          >
            {!isMenuOpen ? (
              <svg
                width={25}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width={25}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L18 18M6 18L18 6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          {/* Logo */}
          <div className="hidden md:flex md:justify-center md:items-center md:mb-4">
            <img
              src={Logo}
              alt="Logo"
              className="w-10 h-10 md:w-16 md:h-16 mx-auto"
            />
          </div>
          <h1 className="md:hidden text-center text-xl md:text-left font-bold">
            ระบบบันทึกการเข้าเรียนและกิจกรรม
          </h1>
          <div className="sm:hidden">
            <svg
              width={25}
              fill="#ffffff"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#ffffff"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M4,12a1,1,0,0,0,1,1h7.59l-2.3,2.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l4-4a1,1,0,0,0,.21-.33,1,1,0,0,0,0-.76,1,1,0,0,0-.21-.33l-4-4a1,1,0,1,0-1.42,1.42L12.59,11H5A1,1,0,0,0,4,12ZM17,2H7A3,3,0,0,0,4,5V8A1,1,0,0,0,6,8V5A1,1,0,0,1,7,4H17a1,1,0,0,1,1,1V19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V16a1,1,0,0,0-2,0v3a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V5A3,3,0,0,0,17,2Z"></path>
              </g>
            </svg>
          </div>
        </div>
        <div className="hidden md:block text-center mt-2 mb-6">
          <h2 className="text-xl font-bold">{User? `${User.fName} ${User.lName}` : "ไม่มีชื่อ"}</h2>
          <div className="mt-2 h-1 w-16 bg-secondary mx-auto rounded-full"></div>
        </div>
        <nav className="overflow-y-auto flex-1 md:max-h-[calc(100vh-260px)]
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-primary/60
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/30
          dark:[&::-webkit-scrollbar-track]:bg-primary/60
          dark:[&::-webkit-scrollbar-thumb]:bg-white/30">
          <ul className="grid grid-cols-5 md:block">
            {navLinks.map((link, index) => (
              <li key={index} className="md:mb-2 md:px-3">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `h-full flex flex-col md:flex-row items-center content-center gap-2 border-t-[3px] px-4 py-3 md:rounded-lg md:border-0 ${
                      isActive
                        ? "border-secondary md:bg-secondary text-white"
                        : "border-transparent text-white hover:bg-accent/50 hover:text-white transition-colors duration-300"
                    }`
                  }
                  onClick={closeMenu}
                >
                  <img
                    src={`/ico/${link.icon}`}
                    alt={link.name}
                    className="w-6 h-6 md:w-6 md:h-6 nav-icon"
                  />

                  <span className="text-sm text-center md:text-left font-medium">
                    {link.name}
                  </span>
                </NavLink>
              </li>
            ))}
           
          </ul>
        </nav>
        <div className="hidden mt-auto mx-3 mb-6 md:block">
          <button 
            onClick={Logout}
            className="w-full py-2.5 px-4 text-sm font-medium text-white hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" width={20} className="mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M21.593 10.943c.584.585.584 1.53 0 2.116L18.71 15.95c-.39.39-1.03.39-1.42 0a.996.996 0 0 1 0-1.41 9.552 9.552 0 0 1 1.689-1.345l.387-.242-.207-.206a10 10 0 0 1-2.24.254H8.998a1 1 0 1 1 0-2h7.921a10 10 0 0 1 2.24.254l.207-.206-.386-.241a9.562 9.562 0 0 1-1.69-1.348.996.996 0 0 1 0-1.41c.39-.39 1.03-.39 1.42 0l2.883 2.893zM14 16a1 1 0 0 0-1 1v1.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1.505a1 1 0 1 0 2 0V5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v13A2.5 2.5 0 0 0 5.5 21h7a2.5 2.5 0 0 0 2.5-2.5V17a1 1 0 0 0-1-1z" fill="#ffffff"></path>
            </svg>
            ออกจากระบบ
          </button>
        </div>
        <div className="hidden md:block text-center text-xs text-white/70 mb-3 font-body">
          © {new Date().getFullYear()} โรงเรียนน้ำพองศึกษา
        </div>
      </header>
      <main className="md:ml-56 min-h-dvh bg-background font-body">
        <div className="hidden md:block sticky top-0 z-10 mt-0 ml-0 mr-0 mb-6 bg-white p-4 shadow-sm border-b border-line">
          <h1 className="text-2xl font-bold text-primary font-heading">ระบบบันทึกและติดตามการเข้าเรียนและกิจกรรมของนักเรียน สำหรับคุณครู</h1>
        </div>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default App;
