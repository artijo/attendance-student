function ErrorAlertActivity() {
    return (
        <div>

            <span className="flex flex-col items-center justify-center gap-2 py-3 border rounded-md">
                <span className="text-red-600">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-10 h-10"
                    fill="#FA5252"
                    >
                    <path d="M24 3C12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21S35.6 3 24 3zm0 2c10.5 0 19 8.5 19 19s-8.5 19-19 19S5 34.5 5 24 13.5 5 24 5zm6.99 10.99a1 1 0 00-.7.3L24 22.59l-6.29-6.3a1 1 0 10-1.42 1.42L22.59 24l-6.3 6.29a1 1 0 101.42 1.42L24 25.41l6.29 6.3a1 1 0 001.42-1.42L25.41 24l6.3-6.29a1 1 0 00-.72-1.72z" />
                    </svg>
                </span>
                <span className="text-lg font-bold text-rose-600">ข้อผิดพลาดของผู้ใช้</span>
                <span className="text-sm font-semibold text-gray-700">ไม่สามารถเลือกวันสิ้นสุดน้อยกว่าวันที่เริ่มได้</span>
            </span>
        </div>
    );
  }
  
  export default ErrorAlertActivity;
  