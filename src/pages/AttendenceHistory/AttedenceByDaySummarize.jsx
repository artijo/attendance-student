import { DateTime } from "luxon";
import React, { useState } from "react";
import { formatDateToThai, formatDayOfWeeks } from "../../helper";
import { useNavigate } from "react-router-dom";
import Calendar from "../../components/AttendenceHistory/Calendar";

function daybetween(Start, End) {
    const dates = [];
    if (Start !== "" && End !== "") {
        const startDate = DateTime.fromISO(Start).setZone('Asia/Bangkok');
        const endDate = DateTime.fromISO(End).setZone('Asia/Bangkok');
        const dtNow = DateTime.now();
        let currentDate = startDate;
        while (currentDate <= endDate) {
            if (
                currentDate > dtNow
            ) {
                break;
            }
            if (currentDate.weekday !== 6 && currentDate.weekday !== 7) {

                dates.push(currentDate.toISODate().split("-").join("-"));
            };
            currentDate = currentDate.plus({ days: 1 });
        }
    } else {
        console.error("termStart or termEnd is not set!");
    }
    return dates;
}

function AttedenceByDaySummarize({ term }) {
    const navigate = useNavigate();
    
    const navigateDetailPage = (date) => {
        navigate('/history/datedetail', { state: { date: date, termId: term.termId } })
    }
    
    return (
        <div>
            <Calendar
                term={term}
                navigateDetailPage={navigateDetailPage}
            />
        </div>
    );

};

export default AttedenceByDaySummarize;