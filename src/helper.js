import { DateTime } from "luxon";

export const callClassroomStudentInfo = async () => {
    
}

export const formatTitle = (title) => {
    switch (title) {
        case 'BOY':
            return 'เด็กชาย';
        case 'GIRL':
            return 'เด็กหญิง';
        case 'MR':
            return 'นาย';
        case 'MS':
            return 'นางสาว';
        default:
            return title;
    }
}

export const getThaiMonth = (month) => {
    switch (month) {
        case 1:
            return 'มกราคม';
        case 2:
            return 'กุมภาพันธ์';
        case 3:
            return 'มีนาคม';
        case 4:
            return 'เมษายน';
        case 5:
            return 'พฤษภาคม';
        case 6:
            return 'มิถุนายน';
        case 7:
            return 'กรกฎาคม';
        case 8:
            return 'สิงหาคม';
        case 9:
            return 'กันยายน';
        case 10:
            return 'ตุลาคม';
        case 11:
            return 'พฤศจิกายน';
        case 12:
            return 'ธันวาคม';
        default:
            return 'ไม่ทราบเดือน';
    }
}

export const weekDayToThaiString = (day) => {
    switch (day) {
        case 1:
            return 'จันทร์';
        case 2:
            return 'อังคาร';
        case 3:
            return 'พุธ';
        case 4:
            return 'พฤหัสบดี';
        case 5:
            return 'ศุกร์';
        case 6:
            return 'เสาร์';
        case 7:
            return 'อาทิตย์';
        default:
            return 'เลขวันไม่ถูกต้อง';

    }
}


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