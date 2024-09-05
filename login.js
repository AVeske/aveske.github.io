const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");

const jwtAddress = 'https://01.kood.tech/api/auth/signin';

const fetchJWT = async (username, password) => {
    const credentials = `${username}:${password}`;
    const base64Credentials = btoa(credentials);
    
    try {
        const response = await fetch(jwtAddress, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Credentials}`
            }
        });

        const responseBody = await response.json();

        // Handling GraphQL-specific errors if any
        if (responseBody.errors) {
            throw new Error(`GraphQL error: ${responseBody.errors.map(e => e.message).join(', ')}`);
        }

        // Handling HTTP response status
        if (response.status == 403) {
            alert('Invalid credentials');
            throw new Error('Invalid credentials');
        }

        if (response.status == 200) {
            console.log('JWT received:', responseBody);
            return responseBody; // Assuming JWT is returned in the response body
        } else {
            alert('Invalid credentials');
            throw new Error('Login failed with status code: ' + response.status);
        }
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

const validateLogin = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const token = await fetchJWT(username, password);

        // If login is successful, redirect to the profile page
        if (token) {
            localStorage.setItem('jwtToken', token); // Store the JWT for future use
            window.location.href = "profile.html";
        }
    } catch (error) {
        console.error("Login validation failed:", error);
        alert("Failed to login. Please check your credentials.");
    }
};

// Event listeners for login button and Enter key
loginBtn.addEventListener("click", () => {
    console.log("Login button clicked!");
    validateLogin();
});

document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        loginBtn.click();
    }
});
