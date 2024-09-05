async function fetchUserResultData(userId) {
    const query = `
    query GetUserResultData($userId: Int!) {
        result(where: { userId: { _eq: $userId } }) {
            grade
            path
        }
    }`;

    const response = await fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
            query: query,
            variables: { userId: userId }
        })
    });

    const data = await response.json();
    if (!data.data || !data.data.result || data.data.result.length === 0) {
        console.error('Result data not found in the response:', data);
        throw new Error('Result data is undefined');
    }

    return data.data.result;
}

function processResultData(resultData) {
    const categories = {
        "Piscine Go": { passCount: 0, failCount: 0 },
        "Piscine JS": { passCount: 0, failCount: 0 },
    };

    resultData.forEach(result => {
        const path = result.path;

        if (path.startsWith('/johvi/piscine-go/')) {
            if (result.grade >= 1) {  // Assuming pass is when grade >= 1
                categories["Piscine Go"].passCount++;
            } else {
                categories["Piscine Go"].failCount++;
            }
        } else if (path.startsWith('/johvi/div-01/piscine-js/')) {
            if (result.grade >= 1) {  // Assuming pass is when grade >= 1
                categories["Piscine JS"].passCount++;
            } else {
                categories["Piscine JS"].failCount++;
            }
        }
    });

    return categories;
}

function generateInteractivePieChartSVG(percentage, label) {
    const radius = 25; // Circle radius
    const circumference = 2 * Math.PI * radius; // Circumference of the circle

    // Length of the "pass" and "fail" segments based on the percentage
    const passLength = (percentage / 100) * circumference;
    const failLength = circumference - passLength;

    return `
    <div class="pie">
        <div class="pie-label">${label}</div>
        <svg viewBox="0 0 120 120" class="pie">
            <!-- Fail Slice -->
            <circle class="fail" r="${radius}" cx="60" cy="60" 
                stroke-dasharray="${failLength} ${circumference}" 
                stroke-dashoffset="0"
                style="stroke: red;"></circle>
            
            <!-- Pass Slice -->
            <circle class="pass" r="${radius}" cx="60" cy="60" 
                stroke-dasharray="${passLength} ${circumference}" 
                stroke-dashoffset="${-failLength}"
                style="stroke: green;"></circle>
        </svg>
    </div>
    `;
}

async function displayGradeDistribution() {
    const userId = await fetchUserId();

    if (!userId) {
        console.error('User ID could not be retrieved');
        return;
    }

    try {
        const resultData = await fetchUserResultData(userId);
        const categories = processResultData(resultData);

        // Calculate pass percentages
        const piscineGoPassPercentage = categories["Piscine Go"].passCount / (categories["Piscine Go"].passCount + categories["Piscine Go"].failCount) * 100;
        const piscineJsPassPercentage = categories["Piscine JS"].passCount / (categories["Piscine JS"].passCount + categories["Piscine JS"].failCount) * 100;

        // Generate interactive SVGs for each category
        const piscineGoSVG = generateInteractivePieChartSVG(piscineGoPassPercentage, 'Piscine Go');
        const piscineJsSVG = generateInteractivePieChartSVG(piscineJsPassPercentage, 'Piscine JS');

        // Insert SVGs into the respective containers
        document.getElementById('piscine-go').innerHTML = piscineGoSVG;
        document.getElementById('piscine-js').innerHTML = piscineJsSVG;

        // Get the hover text element
        const hoverText = document.getElementById('hover-text-central');

        // Event listeners for Piscine Go
        document.querySelector('#piscine-go .pass').addEventListener('mouseenter', () => {
            hoverText.innerHTML = `${piscineGoPassPercentage.toFixed(1)}% Pass<br>(Piscine Go)`;
            hoverText.style.opacity = 1;
        });

        document.querySelector('#piscine-go .fail').addEventListener('mouseenter', () => {
            hoverText.innerHTML = `${(100 - piscineGoPassPercentage).toFixed(1)}% Fail<br>(Piscine Go)`;
            hoverText.style.opacity = 1;
        });

        // Event listeners for Piscine JS
        document.querySelector('#piscine-js .pass').addEventListener('mouseenter', () => {
            hoverText.innerHTML = `${piscineJsPassPercentage.toFixed(1)}% Pass<br>(Piscine JS)`;
            hoverText.style.opacity = 1;
        });

        document.querySelector('#piscine-js .fail').addEventListener('mouseenter', () => {
            hoverText.innerHTML = `${(100 - piscineJsPassPercentage).toFixed(1)}% Fail<br>(Piscine JS)`;
            hoverText.style.opacity = 1;
        });

        // Hide hover text when mouse leaves the pie charts
        document.querySelectorAll('.pie').forEach(pie => {
            pie.addEventListener('mouseleave', () => {
                hoverText.style.opacity = 0;
            });
        });

    } catch (error) {
        console.error("Error displaying grade distribution:", error);
        document.getElementById('piscine-go').innerHTML = `<svg width="120" height="120"><text x="50%" y="50%" text-anchor="middle" fill="red">Error</text></svg>`;
        document.getElementById('piscine-js').innerHTML = `<svg width="120" height="120"><text x="50%" y="50%" text-anchor="middle" fill="red">Error</text></svg>`;
    }
}





