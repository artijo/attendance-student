import { DateTime } from "luxon";

function EnrollmentCard({ enrollmentInfo, index }) {
    // console.log(enrollmentInfo);
    const teacher = enrollmentInfo.timetable.subject.teacher;
    const timetable = enrollmentInfo.timetable;
    const subject = enrollmentInfo.timetable.subject;

    const timeFormat = (time) => {
        const spiltTime = time.split(":");
        return `${spiltTime[0]}:${spiltTime[1]}`;
    };

    const compareTime = () => {
        const dtNow = DateTime.now().setZone("Asia/Bangkok");
        const dtStart = DateTime.fromISO(timetable.timeStart).setZone("Asia/Bangkok");
        const dtEnd = DateTime.fromISO(timetable.timeEnd).setZone("Asia/Bangkok");
        // console.log(dtNow >= dtStart);
        // console.log(dtStart);
        if (dtNow >= dtStart && dtNow <= dtEnd) {
            // console.log(true);
            return true;
        } else {
            // console.log(false);
            return false;
        };
    };

    const getSubjectBgStyle = (subject) => {
        // Generate a consistent color based on subject code
        const hash = subject.subCode.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const hue = hash % 360;
        const saturation = 75 + (hash % 20);
        const lightness = 40 + (hash % 10);

        return {
            backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            border: `1px solid hsl(${hue}, ${saturation + 10}%, ${lightness - 10}%)`
        };
    };

    // className="flex flex-col gap-3 p-4 border border-gray-200 bg-gray-100 rounded-lg"
    // "flex flex-col gap-3 p-6 rounded-lg bg-yellow-300/90"
    return (
        <div>
            {compareTime() ?
                <div
                    className="flex flex-col gap-3 p-5 bg-secondary rounded-2xl shadow-md text-white"
                >
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">คาบที่ {index} : {timeFormat(timetable.timeStart)} - {timeFormat(timetable.timeEnd)}</p>
                        <p className="px-1.5 bg-yellow-100 rounded-md text-yellow-700 text-xs font-normal">กำลังอยู่ในคาบ</p>

                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="w-fit h-fit p-1.5 border-2 border-white text-white rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex flex-row items-center gap-2">
                                <h4 className="text-lg font-semibold">{subject.subNameThai}</h4>
                                <h5 className="px-1.5 bg-blue-100 rounded-md text-blue-600 text-xs font-normal">{subject.subCode}</h5>
                            </div>
                            <p className="text-sm font-medium">คุณครู {teacher.fName} {teacher.lName}</p>
                        </div>
                    </div>
                
                    <button className="text-sm mt-2 w-fit ml-auto px-2 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
                        ลงเช็คชื่อ
                    </button>
                </div> :
                <div
                    className="flex flex-col gap-3 p-5 bg-white rounded-2xl shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <p className='text-sm font-bold text-primary'>คาบที่ {index} : {timeFormat(timetable.timeStart)} - {timeFormat(timetable.timeEnd)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="w-fit h-fit p-1.5 border-2 border-blue-300 text-blue-200 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex flex-row items-center gap-2">
                                <h4 className="text-lg font-semibold">{subject.subNameThai}</h4>
                                <h5 className="px-1.5 bg-blue-100 rounded-md text-blue-600 text-xs font-normal">{subject.subCode}</h5>
                            </div>
                            <p className="text-sm font-medium">คุณครู {teacher.fName} {teacher.lName}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">

                        {/* <button className="text-sm mt-2 px-2 py-1.5  bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
                ลงเช็คชื่อ
            </button> */}
                    </div>

                </div>

            }
        </div>

    );
};

export default EnrollmentCard;