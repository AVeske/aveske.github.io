const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const errorMessage = document.getElementById("error-message"); // Define globally here

const jwtAddress = 'https://01.kood.tech/api/auth/signin';

// Function to check if both inputs have values
const checkInputs = () => {
    if (usernameInput.value.trim() !== '' && passwordInput.value.trim() !== '') {
        loginBtn.disabled = false; // Enable the button
        loginBtn.classList.add('enabled'); // Add class to handle styles
    } else {
        loginBtn.disabled = true; // Disable the button
        loginBtn.classList.remove('enabled');
    }
};

// Attach input event listeners to check the inputs on each keystroke
usernameInput.addEventListener("input", checkInputs);
passwordInput.addEventListener("input", checkInputs);

// Initially disable the login button until inputs are filled
window.onload = () => {
    loginBtn.disabled = true;
};

// Show custom error message
const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    // Clear the username and password fields when an error is shown
    usernameInput.value = '';
    passwordInput.value = '';
    checkInputs(); // Disable the login button again since the fields are now empty

    // Hide the message after 3 seconds
    setTimeout(() => {
        errorMessage.classList.add('hide');
        setTimeout(() => {
            errorMessage.classList.remove('show', 'hide');
        }, 500); // Match the fadeOut animation duration
    }, 3000);
};

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
        if (response.status === 403) {
            showError("Invalid Credentials");
            throw new Error('Invalid credentials');
        }

        if (response.status === 200) {
            console.log('JWT received:', responseBody);
            return responseBody; // Assuming JWT is returned in the response body
        } else {
            showError("Invalid Credentials");
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
        showError("Failed to login. Please check your credentials.");
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
