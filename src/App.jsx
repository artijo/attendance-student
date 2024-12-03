import { Outlet, Link, NavLink } from "react-router";

function App() {
  const navLinks = [
    { name: "แดชบอร์ด", path: "/dashboard", icon:"home.svg" },
    { name: "นักเรียน", path: "/students", icon:"student.svg" },
    { name: "ครู", path: "/teachers", icon:"teacher.svg" },
    { name: "ห้องเรียน", path: "/classroom", icon:"classroom.svg" },
    { name: "วิชาเรียน", path: "/subjects", icon:"subject.svg" },
    { name: "กิจกรรม", path: "/activities", icon:"activity.svg" },
    { name: "การเข้าเรียน", path: "/attendances", icon:"attendance.svg" },
    { name: "คำร้อง", path: "/leavereq", icon: "leave.svg" },
    { name: "ตั้งค่า", path: "/settings", icon: "settings.svg" },
  ];

  function openMenu() {
    document.querySelector("header").classList.toggle("active");
  }

  return (
    <>
      <header className="bg-background-alt text-white sticky left-0 top-0 md:bottom-0 md:fixed md:w-56 h-14 md:h-full">
        <div className="p-2 md:p-3 text-white flex sm:block justify-between items-center h-14">
          <div
            id="toggle"
            className="sm:hidden flex items-center gap-1 border-2 my-2 p-2"
            onClick={openMenu}
          >
            <svg
              width={25}
              viewBox="-2.4 -2.4 28.80 28.80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#CCCCCC"
                strokeWidth="0.624"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
              </g>
            </svg>
            <span className="text-sm">MENU</span>
          </div>
          <h1 className="text-center text-xl md:text-left">
            ระบบจัดการโรงเรียน
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
        <nav>
          <ul className="grid grid-cols-5 md:block">
            {navLinks.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `h-full flex flex-col md:flex-row items-center content-center gap-2 border-t-[3px] px-4 py-3 md:border-s-[3px] md:border-t-0 ${
                      isActive
                        ? "border-blue-500 bg-background-active text-white"
                        : "border-transparent text-white hover:border-gray-100 hover:bg-gray-50 hover:text-gray-700"
                    }`
                  }
                >
                  <img
                    src={`/ico/${link.icon}`}
                    alt={link.name}
                    className="w-6 h-6 md:w-8 md:h-8 nav-icon"
                  />

                  <span className="text-sm text-center font-medium">
                    {link.name}
                  </span>
                </NavLink>
              </li>
            ))}
           
          </ul>
        </nav>
        <div className="hidden mt-10 ml-4 md:flex items-center">
        <svg viewBox="0 0 24 24" width={25} fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fillRule="evenodd" clipRule="evenodd" d="M21.593 10.943c.584.585.584 1.53 0 2.116L18.71 15.95c-.39.39-1.03.39-1.42 0a.996.996 0 0 1 0-1.41 9.552 9.552 0 0 1 1.689-1.345l.387-.242-.207-.206a10 10 0 0 1-2.24.254H8.998a1 1 0 1 1 0-2h7.921a10 10 0 0 1 2.24.254l.207-.206-.386-.241a9.562 9.562 0 0 1-1.69-1.348.996.996 0 0 1 0-1.41c.39-.39 1.03-.39 1.42 0l2.883 2.893zM14 16a1 1 0 0 0-1 1v1.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1.505a1 1 0 1 0 2 0V5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v13A2.5 2.5 0 0 0 5.5 21h7a2.5 2.5 0 0 0 2.5-2.5V17a1 1 0 0 0-1-1z" fill="#ffffff"></path></g></svg>
          <button className="p-2 md:p-3">ออกจากระบบ</button>
        </div>
      </header>
      <main className="md:ml-56 p-4 min-h-dvh">
        <Outlet />
      </main>
    </>
  );
}

export default App;
