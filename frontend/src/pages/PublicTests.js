import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useEffect } from "react";
import TestInfo from "./TestInfo";
import './PublicTests.css'
import { useLocation } from "react-router-dom";

export default function PublicTests(){
    const [tests,setTests] = useState([]);
    const location = useLocation();
    useEffect(()=>{
        const fetchTests = async()=>{
            try{
                const testData = await axiosInstance.get('/tests/getAllPublicTests');
                setTests(testData.data);
            }
            catch(e){
                console.error("Error fetching tests : ",e);
            }
        }
        fetchTests();
    },[location.pathname])    
    return (
        <div className="container">
            <h1 className="title">TESTS</h1>
            {tests.length === 0 ? (
                <p>No tests available.</p>
            ) : (
                tests.map((test) => (
                    <TestInfo key={test.test_id} test={test} />
                ))
            )}
        </div>
    );
};
