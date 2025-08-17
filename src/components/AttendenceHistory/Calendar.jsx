import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { getThaiMonth } from "../../helper";
import DatePicker from "./DatePicker";
// import DatePicker from "./Calendar/DatePicker";
function Calendar({
    term,
    navigateDetailPage
}) {
    const [monthList, setMonthList] = useState([]);
    const [selectMonth, setSelectMonth] = useState(null);
    const [selectDate, setSelectDate] = useState("");
    const createMonthList = () => {
        const startDate = DateTime.fromISO(term.termStart).setZone('Asia/Bangkok').month;
        const endDate = DateTime.fromISO(term.termEnd).setZone('Asia/Bangkok').month;
        let monthRange = [];
        for (let i = startDate; i <= endDate; i++) {
            monthRange.push(i);
        };
        setMonthList(monthRange);
        setSelectMonth(monthRange[0]);

    };

    const handleSelectMonth = (operation) => {
        if (operation == '+') {
            let addMonth = selectMonth;
            addMonth++;
            // console.log(addMonth);
            if (monthList.includes(addMonth)) setSelectMonth(addMonth);
        } else if (operation == '-') {
            let minusMonth = selectMonth;
            minusMonth--;
            if (monthList.includes(minusMonth)) setSelectMonth(minusMonth);
        }
    };


    useEffect(() => {
        if (term != null) {
            createMonthList();
        }

    }, [term]);

    return (
        <div className="w-full h-fit p-2">
            { selectDate == "" && (
                <div className="flex items-center px-2 py-1 bg-yellow-200 border border-yellow-300 rounded-md mb-4">
                    <div className="flex items-center gap-4 text-xs">
                        <span className="text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <div className="flex-1">
                            <strong className="block font-medium text-yellow-500">กรุณาเลือกวันที่ต้องการดูรายละเอียดการเข้าเรียน</strong>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="w-full flex justify-between items-center">
                <div
                    className="p-1 shadow  rounded-lg flex justify-center items-center"
                    onClick={() => handleSelectMonth('-')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                        <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="w-3/4 flex justify-center items-center">
                    <h5 className="text-base font-medium">{getThaiMonth(selectMonth)}</h5>
                </div>
                <div
                    className="p-1 shadow rounded-lg flex justify-center items-center"
                    onClick={() => handleSelectMonth('+')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="border-t border-gray-200 mt-2.5 mb-2.5"></div>
            <div className="grid grid-cols-7 gap-x-2 gap-y-2 mb-2 text-gray-400 text-xs">
                <p className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1">อา.</p>
                <p className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1">จ.</p>
                <p className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1">อ.</p>
                <p className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1">พ.</p>
                <p className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1">พฤ.</p>
                <p className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1">ศ.</p>
                <p className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1">ส.</p>
            </div>
            <DatePicker term={term} month={selectMonth} selectDate={selectDate} setSelectDate={setSelectDate} />
            <button
                type="button"
                className={`bg-primary w-full text-white font-medium py-1.5 px-2.5 mt-5 rounded hover:bg-primary-dark transition duration-300 ${selectDate == "" ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => navigateDetailPage(selectDate)}
            >
                รายละเอียดการเข้าเรียน
            </button>
        </div>
    );
};

export default Calendar;