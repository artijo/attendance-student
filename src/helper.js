import { DateTime } from "luxon";

export function formatDateToThai(date) {
  // YYYY-MM-DD
  const dateSpilt = date.split("-");
  let month = "";
  let year = parseInt(dateSpilt[0]) + 543;
  let day = "";

  if (parseInt(dateSpilt[2].charAt(0)) === 0) {
    day += parseInt(dateSpilt[2].charAt(1));
  } else {
    day += parseInt(dateSpilt[2]);
  }

  const thaiMonths = [
    "มกราคม", // เดือนที่ 1
    "กุมภาพันธ์", // เดือนที่ 2
    "มีนาคม", // เดือนที่ 3
    "เมษายน", // เดือนที่ 4
    "พฤษภาคม", // เดือนที่ 5
    "มิถุนายน", // เดือนที่ 6
    "กรกฎาคม", // เดือนที่ 7
    "สิงหาคม", // เดือนที่ 8
    "กันยายน", // เดือนที่ 9
    "ตุลาคม", // เดือนที่ 10
    "พฤศจิกายน", // เดือนที่ 11
    "ธันวาคม", // เดือนที่ 12
  ];

  // ตรวจสอบว่าเลขเดือนอยู่ในช่วง 1-12
  if (parseInt(dateSpilt[1]) >= 1 && parseInt(dateSpilt[1]) <= 12) {
    month += thaiMonths[parseInt(dateSpilt[1]) - 1];
  } else {
    console.log("เลขเดือนไม่ถูกต้อง");
  }

  return `${day} ${month} ${year}`;
}

export function formatDayOfWeeks(dayOfWeek) {
  const dayOfWeeksThai = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
  for (let i = 0; i <= dayOfWeeksThai.length; i++) {
    if (dayOfWeek - 1 === i) {
      return dayOfWeeksThai[i];
    }
  }
}

export const formatTitle = (title) => {
  switch (title) {
    case "BOY":
      return "เด็กชาย";
    case "GIRL":
      return "เด็กหญิง";
    case "MR":
      return "นาย";
    case "MS":
      return "นางสาว";
    default:
      return title;
  }
};

export const getThaiMonth = (month) => {
  // console.log(month);
  switch (Number(month)) {
    case 1:
      // console.log('1')
      return "มกราคม";
    case 2:
      return "กุมภาพันธ์";
    case 3:
      return "มีนาคม";
    case 4:
      return "เมษายน";
    case 5:
      return "พฤษภาคม";
    case 6:
      return "มิถุนายน";
    case 7:
      return "กรกฎาคม";
    case 8:
      return "สิงหาคม";
    case 9:
      return "กันยายน";
    case 10:
      return "ตุลาคม";
    case 11:
      return "พฤศจิกายน";
    case 12:
      return "ธันวาคม";
    default:
      return "ไม่ทราบเดือน";
  }
};

export const getThaiMonthAbbreviation = (monthNumber) => {
  switch (monthNumber) {
    case 1:
      return "ม.ค.";
    case 2:
      return "ก.พ.";
    case 3:
      return "มี.ค.";
    case 4:
      return "เม.ย.";
    case 5:
      return "พ.ค.";
    case 6:
      return "มิ.ย.";
    case 7:
      return "ก.ค.";
    case 8:
      return "ส.ค.";
    case 9:
      return "ก.ย.";
    case 10:
      return "ต.ค.";
    case 11:
      return "พ.ย.";
    case 12:
      return "ธ.ค.";
    default:
      return "เดือนผิดพลาด";
  }
};

export const weekDayToThaiString = (day) => {
  switch (day) {
    case 1:
      return "จันทร์";
    case 2:
      return "อังคาร";
    case 3:
      return "พุธ";
    case 4:
      return "พฤหัสบดี";
    case 5:
      return "ศุกร์";
    case 6:
      return "เสาร์";
    case 7:
      return "อาทิตย์";
    default:
      return "เลขวันไม่ถูกต้อง";
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const dt = DateTime.fromISO(dateString);
  return dt.toFormat("dd/MM/yyyy");
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const dt = DateTime.fromISO(dateString);
  return dt.toFormat("dd/MM/yyyy HH:mm น.");
};

export const formatTimeThai = (timeString) => {
  if (!timeString) return "-";
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes} น.`;
};

export function daybetween(Start, End) {
  const dates = [];
  if (Start !== "" && End !== "") {
    const startDate = DateTime.fromISO(Start).setZone("Asia/Bangkok");
    const endDate = DateTime.fromISO(End).setZone("Asia/Bangkok");
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate.toISODate().split("-").join("-")); // เพิ่มวันที่ในรูปแบบ YYYY-MM-DD
      currentDate = currentDate.plus({ days: 1 }); // เพิ่มวันทีละ 1
    }
  } else {
    console.error("termStart or termEnd is not set!");
  }
  return dates;
}

export const formatThaiDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatThaiDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
