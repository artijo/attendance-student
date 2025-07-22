import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { getThaiMonth } from "../../helper";
import DatePicker from "./Calendar/DatePicker";
function Calendar({
    term
}) {
    const [monthList, setMonthList] = useState([]);
    const [selectMonth, setSelectMonth] = useState(null);
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
        if(operation == '+') {
            let addMonth = selectMonth;
            addMonth++;
            console.log(addMonth);
            if(monthList.includes(addMonth)) setSelectMonth(addMonth);
        }else if(operation == '-') {
            let minusMonth = selectMonth;
            minusMonth--;
            if(monthList.includes(minusMonth)) setSelectMonth(minusMonth);
        }
    };

    useEffect(() => {
        if (term != null) {
            createMonthList();
        }

    }, [term]);

    return (
        <div className="w-full h-fit p-2">
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
                <p className="place-self-center">อา.</p>
                <p className="place-self-center">จ.</p>
                <p className="place-self-center">อ.</p>
                <p className="place-self-center">พ.</p>
                <p className="place-self-center">พฤ.</p>
                <p className="place-self-center">ศ.</p>
                <p className="place-self-center">ส.</p>
            </div>
            <DatePicker term={term} month={selectMonth}/>
        </div>
    );
};

export default Calendar;