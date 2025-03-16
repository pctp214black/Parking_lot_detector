import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Si usas react-router-dom
import "../components/RegisterUser.css"

const RegisterUser = ({ type, setUserID}) => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    const handleSubmit = async (event) => {
        event.preventDefault();
        const url = type === "Log In" ? "http://localhost:5000/users/login" : "http://localhost:5000/users/addUser";

        const request = {
            method: "POST",
            headers: {
                "Content-type": "appliction/json"
            },
            body: JSON.stringify({ "userName": userName, "password": password })
        }
        const data = await fetch(url, request);
        const { response, error, userID } = await data.json();
        if (response && userID) {
            setUserID(userID);
            navigate('/manageparkings');
        } else if (error) {
            console.log(error)
        }

    }


    return (
        <>
            <div className="userForm">
                <form onSubmit={handleSubmit}>
                    <h2>{type}</h2>
                    <hr />
                    <div>
                        <label>User Name: </label>
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
                    </div>
                    <div>
                        <label>Password: </label>
                        <input type="password" onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit">{type}</button>
                </form>
            </div>
        </>
    )
}

export default RegisterUser;