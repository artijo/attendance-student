import { DateTime } from "luxon";

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

export  const formatDate = (dateString) => {
      if (!dateString) return "-";
      const dt = DateTime.fromISO(dateString);
      return dt.toFormat("dd/MM/yyyy");
    };
  
 export   const formatDateTime = (dateString) => {
      if (!dateString) return "-";
      const dt = DateTime.fromISO(dateString);
      return dt.toFormat("dd/MM/yyyy HH:mm น.");
    };