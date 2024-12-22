import PropTypes from "prop-types";
import { formatStatus } from "../../helper/attStatus.js";
import { DateTime } from "luxon";

export const DetailAttendenceHistory = ({ attendence_info, setShow }) => {
    const formatDateTime = (date) => {
        const dt = DateTime.fromISO(date, { zone: 'UTC' });
        return `วัน ${dt.day} เดือน ${dt.month} ปี ${dt.year} เวลา ${dt.hour}:${dt.minute.toString().padStart(2, "0")}`;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">รายละเอียดการเข้าเรียน</h2>
                    <button
                        type="button"
                        onClick={() => setShow(false)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                        X
                    </button>
                </div>
                <div>
                    <table className="table-auto w-full border-collapse border border-gray-300 text-left">
                        
                            {attendence_info.length > 0 ? (
                                attendence_info.map((element, index) => (
                                    <tbody key={index}>
                                        <tr className="border-b">
                                            <td className="py-2 px-4 font-medium">เช็คชื่อด้วยวิธี</td>
                                            <td className="py-2 px-4">{element.attMethod.attMethodName}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-2 px-4 font-medium">สถานะ</td>
                                            <td className="py-2 px-4">{formatStatus(element.attStatus)}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-2 px-4 font-medium">ลงชื่อวันที่</td>
                                            <td className="py-2 px-4">{formatDateTime(element.attTimestamp)}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-2 px-4 font-medium">จัดการโดย</td>
                                            <td className="py-2 px-4">{element.operatedBy}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-2 px-4 font-medium">เวลาเริ่มเรียน</td>
                                            <td className="py-2 px-4">{formatDateTime(element.studingTime.studingTimeDate)}</td>
                                        </tr>
                                    </tbody>
                                ))
                            ) : (
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">เช็คชื่อด้วยวิธี</td>
                                        <td className="py-2 px-4">-</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">สถานะ</td>
                                        <td className="py-2 px-4">-</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">ลงชื่อวันที่</td>
                                        <td className="py-2 px-4">-</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">จัดการโดย</td>
                                        <td className="py-2 px-4">-</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-4 font-medium">เวลาเริ่มเรียน</td>
                                        <td className="py-2 px-4">-</td>
                                    </tr>
                                </tbody>
                            )}
                        
                    </table>
                </div>
            </div>
        </div>
    );
};

DetailAttendenceHistory.propTypes = {
    attendence_info: PropTypes.array.isRequired,
    setShow: PropTypes.func.isRequired,
};
