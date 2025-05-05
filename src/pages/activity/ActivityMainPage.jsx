import { useState } from "react";

function ActivityMainPage() {
    const [activity, setActivity] = useState([]);
    
    


    return (
        <div className="grid grid-cols-1 gap-4 sm:max-w-md md:max-w-lg mx-auto p-2">
            <div>
                <h2 className="text-2xl font-semibold text-left text-primary font-heading">กิจกรรม</h2>
                <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
            </div>
        </div>
    );
};

export default ActivityMainPage;