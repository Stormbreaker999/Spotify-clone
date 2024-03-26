import { ACCESS_TOKEN, TOKEN_TYPE, EXPIRES_IN } from "../common";


const CLIENT_ID=import.meta.env.VITE_CLIENT_ID;
const scopes="user-top-read user-follow-read playlist-read user-library-read"
const REDIRECT_URL=import.meta.env.VITE_REDIRECT_URL;

const authorizeUser=()=>{
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URL}&scope=${scopes}&show_dialog=true`;
    window.open(url, "login", "width=800,height=600")
}

window.setItemsInLocalStorage=({accessToken, tokenType, expiresIn})=>{
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_TYPE, tokenType);
    localStorage.setItem(EXPIRES_IN, (Date.now()+(expiresIn*1000)));
    window.location.href="http://localhost:3000"
}

document.addEventListener("DOMContentLoaded", ()=>{
    const login_button=document.getElementById("login-to-spotify");
    login_button.addEventListener("click", authorizeUser);
})
window.addEventListener("load", ()=>{
    const accessToken=localStorage.getItem(ACCESS_TOKEN);
    if(accessToken){
        window.location.href="http://localhost:3000/dashboard/dashboard.html";

    }
    if(window.opener && !window.opener.closed){
        window.focus();
        if(!window.location.href.includes("error")){
            window.close();
        }
        const {hash}=window.location;
        const searchParams=new URLSearchParams(hash);
        const accessToken=searchParams.get("#access_token");
        const tokenType=searchParams.get("token_type");
        const expiresIn=searchParams.get("expires_in");
        if(accessToken){
            window.close();
            window.opener.setItemsInLocalStorage({accessToken, tokenType, expiresIn});
            
        }
        else{
            window.close();
        }
    }
})