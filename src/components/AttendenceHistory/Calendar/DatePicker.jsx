import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { daybetween } from "../../../helper";

function DatePicker({ month }) {
    // console.log(month);
    const [row, setRow] = useState({
        1:[],
        2:[],
        3:[],
        4:[],
        5:[],
    });
    const sDate = DateTime.now().set({month: month}).startOf('month');
    const eDate = DateTime.now().set({month: month}).endOf('month');
    const dateList = daybetween(sDate,eDate);
    const days = [7,1,2,3,4,5,6];
    useEffect(() => {
        if(month != null) {
            let rowClone = {...row};
            Object.keys(rowClone).forEach((value,index) => {
                const arrayOfDayInfomation = [];
                days.forEach((value,index) => {
                    arrayOfDayInfomation.push(
                        {
                            weekday: value
                        }
                    )
                });
                rowClone = {...rowClone, [value]: arrayOfDayInfomation}
            });
            
            // const indexOfFirstDay = 
            let currentIndexOfDateList = 0
            Object.keys(rowClone).forEach((value, index) => {
                // console.log(value)
                if(value === '1') {
                    // console.log('yes')
                    const startIndex = rowClone[1].findIndex((value) => value.weekday === DateTime.fromISO(`${dateList[0]}T00:00:00`).setZone('Asia/Bangkok').weekday);
                    // console.log(rowClone[1].length);
                    for(let i = startIndex; i < rowClone[1].length; i++) {
                        // console.log(i)
                        const data = {
                            date: dateList[currentIndexOfDateList],
                            day: DateTime.fromISO(`${dateList[currentIndexOfDateList]}T00:00:00`).setZone('Asia/Bangkok').day,
                            weekday : rowClone[1][i].weekday
                        };
                        // console.log(data);
                        rowClone[1][i] = {...data};
                        // console.log(rowClone[1][i]);
                        currentIndexOfDateList++;
                    };
                }else {
                    // console.log('else')
                    for(let i = 0; i < rowClone[value].length; i++) {
                        if(dateList[currentIndexOfDateList] === undefined) {
                            const data = {
                                weekday : rowClone[1][i].weekday
                            };
                            rowClone[value][i] = {...data};
                        }else{
                            const data = {
                                date: dateList[currentIndexOfDateList],
                                day: DateTime.fromISO(`${dateList[currentIndexOfDateList]}T00:00:00`).setZone('Asia/Bangkok').day,
                                weekday : rowClone[1][i].weekday
                            };
                            rowClone[value][i] = {...data};
                        }
                        
                        // console.log(rowClone[1][i]);
                        currentIndexOfDateList++;
                    }
                }
            });
            console.log(rowClone);
            setRow(rowClone);
        }
    },[month]);
    return (
        <div className="grid grid-cols-1 gap-x-2 gap-y-2">
            {Object.keys(row).length > 0 && Object.keys(row).map((key) => (
                <div key={key} className="grid grid-cols-7 text-xs">
                    { row[key].map((dateObject, index) => (
                        <div key={index} className="place-self-center">
                            {dateObject.day > 0 && dateObject.day}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
export default DatePicker;