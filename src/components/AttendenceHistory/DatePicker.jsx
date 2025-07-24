import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { daybetween } from "../../helper";

function DatePicker({ term, month, selectDate, setSelectDate }) {
    const [row, setRow] = useState({
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
    });
    const termStart = DateTime.fromISO(term.termStart).setZone('Asia/Bangkok');
    const termEnd = DateTime.fromISO(term.termEnd).setZone('Asia/Bangkok');
    const sDate = DateTime.now().set({ month: month }).startOf('month');
    const eDate = DateTime.now().set({ month: month }).endOf('month');
    const dateList = daybetween(sDate, eDate);
    const holidaylist = term.holiday.map((holiday) => {
        const formatDate = DateTime.fromISO(holiday.startHolidayDate).setZone('Asia/Bangkok').toString().split("T")[0];
        return formatDate;
    });
    const days = [7, 1, 2, 3, 4, 5, 6];
    useEffect(() => {
        if (month != null) {
            let rowClone = { ...row };
            Object.keys(rowClone).forEach((value, index) => {
                const arrayOfDayInfomation = [];
                days.forEach((value, index) => {
                    arrayOfDayInfomation.push(
                        {
                            weekday: value
                        }
                    )
                });
                rowClone = { ...rowClone, [value]: arrayOfDayInfomation }
            });
            let currentIndexOfDateList = 0
            Object.keys(rowClone).forEach((value, index) => {
                if (value === '1') {
                    const startIndex = rowClone[1].findIndex((value) => value.weekday === DateTime.fromISO(`${dateList[0]}T00:00:00`).setZone('Asia/Bangkok').weekday);
                    if (days.length - startIndex != 7) {
                        let dayOfTurnBack = 1;
                        for (let i = startIndex - 1; i >= 0; i--) {
                            const turnbacktime = DateTime.fromISO(`${dateList[0]}T00:00:00`).setZone('Asia/Bangkok').minus({ days: dayOfTurnBack });
                            // console.log(turnbacktime.toISO());
                            const data = {
                                date: turnbacktime.toFormat('yyyy-MM-dd'),
                                day: turnbacktime.day,
                                weekday: turnbacktime.weekday,
                            }
                            // console.log(data);

                            rowClone[1][i] = { ...data };
                            dayOfTurnBack++;
                        };
                    };
                    for (let i = startIndex; i < rowClone[1].length; i++) {
                        const data = {
                            date: dateList[currentIndexOfDateList],
                            day: DateTime.fromISO(`${dateList[currentIndexOfDateList]}T00:00:00`).setZone('Asia/Bangkok').day,
                            weekday: rowClone[1][i].weekday
                        };
                        rowClone[1][i] = { ...data };
                        currentIndexOfDateList++;
                    };
                } else if (value === '5') {
                    const lastIndex = rowClone[5].findIndex((value) => value.weekday === DateTime.fromISO(`${dateList[dateList.length - 1]}T00:00:00`).setZone('Asia/Bangkok').weekday);
                    let dayOfFuture = 1;

                    for (let i = 0; i <= lastIndex; i++) {
                        const data = {
                            date: dateList[currentIndexOfDateList],
                            day: DateTime.fromISO(`${dateList[currentIndexOfDateList]}T00:00:00`).setZone('Asia/Bangkok').day,
                            weekday: rowClone[1][i].weekday
                        };
                        rowClone[value][i] = { ...data };
                        currentIndexOfDateList++;
                    }

                    for (let i = lastIndex + 1; i < rowClone[5].length; i++) {
                        const gotothefuture = DateTime.fromISO(`${dateList[dateList.length - 1]}T00:00:00`).setZone('Asia/Bangkok').plus({ days: dayOfFuture });
                        const data = {
                            date: gotothefuture.toFormat('yyyy-MM-dd'),
                            day: gotothefuture.day,
                            weekday: gotothefuture.weekday
                        }
                        // console.log(data);
                        rowClone[5][i] = { ...data };
                        dayOfFuture++;
                    }
                } else {
                    // console.log('else')
                    for (let i = 0; i < rowClone[value].length; i++) {
                        if (dateList[currentIndexOfDateList] === undefined) {
                            const data = {
                                weekday: rowClone[1][i].weekday
                            };
                            rowClone[value][i] = { ...data };
                        } else {
                            const data = {
                                date: dateList[currentIndexOfDateList],
                                day: DateTime.fromISO(`${dateList[currentIndexOfDateList]}T00:00:00`).setZone('Asia/Bangkok').day,
                                weekday: rowClone[1][i].weekday
                            };
                            rowClone[value][i] = { ...data };
                        }

                        // console.log(rowClone[1][i]);
                        currentIndexOfDateList++;
                    }
                }
            });
            // console.log(rowClone);
            setRow(rowClone);
        }
    }, [month]);

    const handleSelectMonth = (date) => {
        if(date === selectDate) {
            setSelectDate("")
        }else{
            setSelectDate(date)
        };
    };



    return (
        <div className="grid grid-cols-1 gap-x-2 gap-y-2">
            {Object.keys(row).length > 0 && Object.keys(row).map((key) => (
                <div key={key} className="grid grid-cols-7 text-sm">
                    {row[key].map((dateObject, index) => {
                        const objectDate = DateTime.fromISO(`${dateObject.date}T00:00:00`).setZone('Asia/Bangkok');
                        // console.log(objectDate.weekday)
                        if(objectDate.weekday == 7 || objectDate.weekday ==  6) {
                            return (
                                <div key={index} className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1 text-gray-200">
                                    {dateObject.day > 0 && dateObject.day}
                                </div>
                            );
                        }else if (objectDate >= termStart && objectDate <= termEnd) {
                            if (holidaylist.includes(dateObject.date)) {
                                return (
                                    <div 
                                        className="flex justify-center cursor-pointer items-center rounded-md place-self-center w-5 h-5 p-1 font-semibold text-red-500 bg-red-100 border border-red-200"
                                        key={index}
                                    >
                                        {dateObject.day > 0 && dateObject.day}
                                    </div>
                                );
                            }
                            if(objectDate >= sDate && objectDate <= eDate) {
                                return (
                                    <div 
                                        key={index}
                                        className={`flex justify-center cursor-pointer items-center rounded-md place-self-center w-5 h-5 p-1 font-semibold
                                            ${selectDate === dateObject.date ? 'bg-primary text-white border-primary shadow hover:bg-blue-400  hover:border-blue-400' : 'hover:bg-gray-300'}
                                        `}
                                        onClick={() => handleSelectMonth(dateObject.date)}
                                    >
                                        {dateObject.day > 0 && dateObject.day}
                                    </div>
                                );
                            };

                            if(!(objectDate >= sDate && objectDate <= eDate)){
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex justify-center cursor-pointer items-center rounded-md place-self-center w-5 h-5 p-1 font-semibold text-gray-500/70
                                            ${selectDate === dateObject.date ? 'bg-primary text-white border-primary shadow hover:bg-blue-400  hover:border-blue-400' : 'hover:bg-gray-300'}
                                        `}
                                        onClick={() => handleSelectMonth(dateObject.date)}
                                    >
                                        {dateObject.day > 0 && dateObject.day}
                                    </div>
                                );
                            };
                        }else {
                            return (
                                <div key={index} className="flex justify-center items-center rounded-md place-self-center w-5 h-5 p-1 text-gray-200">
                                    {dateObject.day > 0 && dateObject.day}
                                </div>
                            );
                        };
                    })}
                </div>
            ))}
        </div>
    );
};
export default DatePicker;