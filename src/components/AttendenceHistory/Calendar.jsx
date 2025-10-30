import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { getThaiMonth } from "../../helper";
import { TIME_ZONE } from "../../config";

// import DatePicker from "./Calendar/DatePicker";
function Calendar({
    term,
    navigateDetailPage
}) {
    let startTermDate = DateTime.fromISO(term.termStart).setZone(TIME_ZONE).startOf('month');
    let endTermDate = DateTime.fromISO(term.termEnd).setZone(TIME_ZONE).endOf('month');
    const [dayList, setDayList] = useState([]);
    const [selectMonthAndYear, setSelectMonthAndYear] = useState({
        month: 2025,
        year: 1
    });
    const [selectDate, setSelectDate] = useState('')


    let holidayList = term.holiday.map((value, index) => {
        const holidayDate = DateTime.fromISO(value.startHolidayDate).setZone(TIME_ZONE).toFormat('yyyy-MM-dd');
        return holidayDate;
    });

    let starDateMonth = DateTime.fromObject({
        month: selectMonthAndYear.month,
        year: selectMonthAndYear.year
    }).startOf('month');
    let endDateMonth = DateTime.fromObject({
        month: selectMonthAndYear.month,
        year: selectMonthAndYear.year
    }).endOf('month');

    const handleSelectDate = (date) => {
        if (date === selectDate) {
            setSelectDate('');
        } else {
            setSelectDate(date);
        };
    };

    const handleSelectMonthAndYearChange = (condition) => {
        let date = DateTime.fromObject({
            month: parseInt(selectMonthAndYear.month),
            year: parseInt(selectMonthAndYear.year),
        });

        if (condition === "increase") {
            date = date.plus({ month: 1 });
            if (date > endTermDate) {
                date = date.minus({ month: 1 });
            };
        } else if (condition === "decrease") {
            date = date.minus({ month: 1 });
            if (date < startTermDate) {
                date = date.plus({ month: 1 });
            };
        };

        setSelectMonthAndYear({
            month: String(date.month),
            year: String(date.year),
        });
    };

    const createDate = () => {
        let dayArr = [];
        let startWeekDay = starDateMonth.weekday; //If weekday is 'wednesday' mean 3
        // let endWeekDay = endDateMonth.weekday; // If weekday is 'friday' mean 5
        let dayInMonths = starDateMonth.daysInMonth;
        // console.log(startWeekDay + 6-endWeekDay + dayInMonths)

        for (let i = 0; i < dayInMonths; i++) {
            let date = starDateMonth.plus({ day: i }).toFormat('yyyy-MM-dd');
            dayArr.push(date);
        };

        let frontEmpty = [];
        for (let i = 1; i < startWeekDay; i++) {
            let date = starDateMonth.minus({ days: i }).toFormat('yyyy-MM-dd');
            frontEmpty.push(date);
        };

        let backEmpty = [];
        for (let i = 1; i <= 42 - (dayArr.length + frontEmpty.length); i++) {
            let date = endDateMonth.plus({ days: i }).toFormat('yyyy-MM-dd');
            backEmpty.push(date);
        }


        dayArr = [...frontEmpty.reverse(), ...dayArr, ...backEmpty];
        // console.log(dayArr);
        setDayList(dayArr);
        return;
    }

    useEffect(() => {
        setSelectMonthAndYear({
            year: String(startTermDate.year),
            month: String(startTermDate.month)
        })
    }, [term])

    useEffect(() => {
        createDate();
    }, [selectMonthAndYear]);

    return (
        <div className="grid grid-col-2">
            <div className="flex justify-between items-center px-1.5">
                <div className="text-gray-500" onClick={() => handleSelectMonthAndYearChange("decrease")}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2
                    className="text-base"
                >
                    {selectMonthAndYear.month && selectMonthAndYear.year && (
                        `${getThaiMonth(selectMonthAndYear.month)} ${(parseInt(selectMonthAndYear.year) + 543)}`
                    )}
                </h2>
                <div className="text-gray-500" onClick={() => handleSelectMonthAndYearChange("increase")}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
                    {["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((value, index) => (
                        <div key={index}>
                            {value}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 place-items-center gap-2 text-center text-sm font-medium">
                    {dayList.map((value, index) => {
                        const valueDate = DateTime.fromISO(`${value}`).setZone(TIME_ZONE).startOf('day');
                        if (holidayList.includes(valueDate.toFormat('yyyy-MM-dd'))) {
                            return (
                                <div
                                    key={index}
                                    className="flex justify-center items-center w-6.5 h-6.5 bg-red-300 text-white font-bold rounded-full"

                                >
                                    {parseInt(value.split('-')[2])}
                                </div>
                            )
                        }

                        if (valueDate >= startTermDate && valueDate <= endTermDate) {
                            if (valueDate >= starDateMonth && valueDate <= endDateMonth) {
                                return (
                                    <div
                                        key={index}
                                        className={`cursor-pointer flex justify-center items-center w-6.5 h-6.5 text-gray-950 font-bold ${selectDate === value && 'rounded-full bg-primary text-white font-medium'} `}
                                        onClick={
                                            !(valueDate.weekday == 6 || valueDate.weekday == 7)
                                                ? () => handleSelectDate(value)
                                                : undefined
                                        }
                                    >
                                        {parseInt(value.split('-')[2])}
                                    </div>
                                )
                            } else {
                                return (
                                    <div
                                        key={index}
                                        className={`cursor-pointer flex justify-center items-center w-6.5 h-6.5 text-gray-500  font-bold ${selectDate === value && 'rounded-full bg-primary text-white font-medium'}`}
                                        onClick={
                                            !(valueDate.weekday == 6 || valueDate.weekday == 7)
                                                ? () => handleSelectDate(value)
                                                : undefined
                                        }
                                    >
                                        {parseInt(value.split('-')[2])}
                                    </div>
                                )
                            }

                        } else {
                            return (
                                <div key={index} className=" flex justify-center items-center w-6.5 h-6.5 text-gray-200 font-bold">
                                    {parseInt(value.split('-')[2])}
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
            <button
                type="button"
                disabled={selectDate === '' ? true : false}
                onClick={selectDate === '' ? null : () => navigateDetailPage(selectDate) }
                className={`
                    w-full rounded-md mt-4 py-2 
                    font-medium
                    cursor-pointer disabled:cursor-not-allowed 
                    transition-all duration-300 ease-in-out
                    ${selectDate === ''
                                        ? 'bg-gray-300 border-gray-300 text-white'
                                        : 'bg-primary border-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg'
                                    }
                `}
            >
                รายละเอียดการเข้าเรียน
            </button>

        </div>
    );
};

export default Calendar;