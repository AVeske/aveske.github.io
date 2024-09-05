document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('transition-overlay');

    // Function to trigger the transition effect
    function startTransition() {
        overlay.classList.add('grow');

        // Delay the actual page load until after the animation
        setTimeout(function() {
            // After the animation completes, you can navigate to the profile page
            document.getElementById('main-content').style.display = 'block'; // Or load new content
        }, 800); // Match the CSS transition duration
    }

    // Simulate starting the transition after a login button click
    const loginButton = document.getElementById('login-btn');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            startTransition();
        });
    }
});
