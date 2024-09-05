async function fetchUserBasicData(userId){
    const query = `
    query GetBasicData($userId: Int!) {
        user(where: {id: {_eq: $userId}}) {
            attrs
            firstName
            lastName
            login
            id
        }
    }`;

    const response = await fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
        },
        body: JSON.stringify({
            query: query,
            variables: { userId: userId }
        })
    });

    const data = await response.json();
    if (!data.data || !data.data.user || data.data.user.length === 0) {
        console.error("User data not found in the response:", data);
        throw new Error("User data is undefined");
    }

    return data.data.user[0];  // Since it's an array, return the first user object
}


function processBasicUserData(resultData){
    const firstName = resultData.firstName;
    const lastName = resultData.lastName;
    const loginNickname = resultData.login;
    const gender = resultData.attrs.gender;

    return`<h1 id="name">${gender === "male" ? "Mr" : (gender === "female" ? "Mrs" : "")} ${firstName} ${lastName}<br> / <br> ${loginNickname}</h1>`
}

async function displayUserBasicInfo(){
    const userId = await fetchUserId();

    if(!userId){
        console.error("User ID could not be retrieved")
        return;
    }

    try{
        const resultData = await fetchUserBasicData(userId)
        const userInfo = processBasicUserData(resultData)
        document.querySelector(".userInfo .userName").innerHTML = userInfo;

    }catch(error){
        console.log("Error displaying user data:", error)
    }
}