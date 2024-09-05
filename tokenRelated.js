function getJWT(){
    return localStorage.getItem("jwtToken");
}

function parseJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    console.log("Parsed JWT payload:", payload); // Check the payload to ensure userId exists
    return payload;
}

async function fetchUserId() {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        console.error('JWT token not found');
        return null;
    }

    try {
        const parsedJWT = parseJWT(token);
        const userId = parsedJWT["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
        console.log("Retrieved User ID:", userId);
        return userId; // Return the user ID
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

