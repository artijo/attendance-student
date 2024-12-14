import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";


const InformationPerson = ({person_uuid, role}) => {
    const [information, setInformation] = useState({});
    const [route, setRoute] = useState("");

    // const roleSet =  async (role) => {
        
    // };

    const fetchData = async () => {
        // await roleSet(role);
        try{  
            const URL = `http://localhost:3000/${route}`
            const response = await axios.get(URL);
            // console.log(response.data);
            const data = response.data;
            console.log(data)
        }catch(err){
            console.log(err);
        };
    };

    useEffect(() => {
        switch(role){
            case "Leader":
                setRoute("");
                break;
            case "Student":
                setRoute(`s/student/${person_uuid}`);
                break;
            case "Teacher":
                setRoute(`t/teacher/${person_uuid}`);
                break;
        };
        fetchData()
    });
    
    // const fetchData = () => {
    //     try{
    //         const response = axios.get
    //     }catch(err){

    //     }
    // }

    return (
        <div className="informationPerson">
            <div className="information-container">
                this is InfomationPerson
            </div>
            
        </div>
    );
};


export default InformationPerson;