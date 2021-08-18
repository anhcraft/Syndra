import React from 'react';
import ReactDOM from 'react-dom';
import SignIn from "./pages/Login";
import api from "./api";
import Profile from "./pages/Profile";

api.getInfo((e: any) => {
    if(e == null) {
        ReactDOM.render(
            <SignIn/>,
            document.getElementById('root')
        );
    } else {
        ReactDOM.render(
            <Profile/>,
            document.getElementById('root')
        );
    }
});
