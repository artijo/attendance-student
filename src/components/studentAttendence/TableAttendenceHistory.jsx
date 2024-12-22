
import PropTypes, { element } from "prop-types";
import { formatStatus } from "../../helper/attStatus.js";
import { useState } from "react";
import { DetailAttendenceHistory } from "./DetailAttendenceHistory.jsx"

export const TableAttendenceHistory =  ({attendence}) => {
    const [show, setShow] = useState(false);
    const [attendanceInfo, setAttendanceInfo] = useState([]);

    const handleOnClick = (attendance) => {
        setAttendanceInfo(attendance)
        setShow(true)
    }

    return (
        <>
            {
                show ? 
                <div className="bg-neutral-700 bg-transparent backdrop-blur-sm absolute top-0 left-0 right-0 bottom-0">
                    <DetailAttendenceHistory attendence_info={attendanceInfo} setShow={setShow}/>
                </div>
                : ""
            }
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm mb-5">
                <thead className="ltr:text-left rtl:text-right">
                    <tr>
                        <th
                        className="text-center whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                        >
                            คาบที่
                        </th>
                        <th
                        className="text-center whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                        >
                            สถานะ
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {
                        attendence.map((element,index) => (
                            <tr className="odd:bg-gray-50" key={element.studyTimeId}>
                                <td className="whitespace-nowrap px-4 py-2 text-gray-700  text-center">{index + 1}</td>
                                {
                                    element.attendance.length > 0 ? 
                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700  text-center">
                                        {/* {formatStatus(element.attendance[0].attStatus)} */}
                                        { formatStatus(element.attendance[0].attStatus) }
                                    </td>
                                    :
                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700  text-center">
                                    -
                                    </td>
                                }
                                <td className="whitespace-nowrap px-4 py-2 text-gray-700  text-center">
                                    <button type="button" onClick={() => handleOnClick(element.attendance)} className="text-blue-400 underline">รายละเอียด</button>
                                </td>
                            </tr>
                        ))
                    }
                    
                </tbody>
            </table>
        </>
       
    );
};

TableAttendenceHistory.propTypes = {
    attendence: PropTypes.array.isRequired
}