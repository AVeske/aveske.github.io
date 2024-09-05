const logoutButton = document.getElementById("logout")

logoutButton.addEventListener("click",()=>{
    localStorage.removeItem("jwtToken")
    window.location.href = "index.html"
})