export const formatStatus = (value) => {
    switch(value){
        case "PRESENT" : 
            return "เข้าเรียน"
        case "ABSENT":
            return "ขาดเรียน"
        case "ACTIVITY":
            return "เข้ากิจกรรม"
        case "LEAVE":
            return "ลา"
    }
}

