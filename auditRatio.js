async function fetchUserAuditData(userId) {
    const query = `
    query GetUserAuditInfo($userId: Int!) {
        user(where: { id: { _eq: $userId } }) {
            totalDown
            totalUp
            auditRatio
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
    if (!data.data || !data.data.user || data.data.user.length === 0) {
        console.error('User data not found in the response:', data);
        throw new Error('User data is undefined');
    }

    return data.data.user[0];
}

function generateAuditRatioSVG(auditRatio, totalDown, totalUp, options = {}) {
    const {
        barHeight = 10,   // Height of each bar, reduced for a thinner appearance
        gap = 10,         // Gap between the bars
        padding = 20      // Padding to leave space for text on the ends
    } = options;

    // Calculate the maximum possible width available for the bars after padding
    const maxBarWidth = 220 - (2 * padding);

    // Determine which value is larger: totalDown or totalUp
    const maxTotal = Math.max(totalDown, totalUp);

    // Calculate the proportional width of each bar
    const doneBarWidth = (totalUp / maxTotal) * maxBarWidth;
    const receivedBarWidth = (totalDown / maxTotal) * maxBarWidth;

    // Round the audit ratio to one decimal place
    const roundedAuditRatio = auditRatio.toFixed(1);

    // Adjust these values to position the bars at the bottom of the SVG
    const svgHeight = 120; // Adjust this to change the height of the SVG
    const bottomY = svgHeight - barHeight - 10; // Positioning the bars near the bottom

    return `
        <svg width="100%" height="100%" viewBox="0 0 300 ${svgHeight}" preserveAspectRatio="xMidYMid meet">
            <!-- Current Ratio Text -->
            <text id="current-ratio-text" x="50%" y="50" text-anchor="middle" fill="black" font-size="24" font-weight="bold">
                Current Ratio: ${roundedAuditRatio}
            </text>
            
            <!-- Done Ratio Bar with rounded corners -->
            <rect id="done-bar" x="${padding}" y="${bottomY - gap - barHeight}" width="${doneBarWidth}" height="${barHeight}" fill="green" rx="5" ry="5" />
            <text id="done-total" x="275" y="${bottomY - barHeight - gap + 8}" text-anchor="end" fill="black">
                Done: ${(totalUp / 1000000).toFixed(2)}Mb
            </text>

            <!-- Received Ratio Bar with rounded corners -->
            <rect id="received-bar" x="${padding}" y="${bottomY}" width="${receivedBarWidth}" height="${barHeight}" fill="red" rx="5" ry="5" />
            <text id="received-total" x="290" y="${bottomY + barHeight - 1}" text-anchor="end" fill="black">
                Received: ${(totalDown / 1000000).toFixed(2)}Mb
            </text>
        </svg>
    `;
}

async function displayAuditRatio() {
    const userId = await fetchUserId();

    if (!userId) {
        console.error('User ID could not be retrieved');
        return;
    }

    try {
        const { auditRatio, totalDown, totalUp } = await fetchUserAuditData(userId);

        const svg = generateAuditRatioSVG(auditRatio, totalDown, totalUp);

        const auditRatioDiv = document.getElementById('audit-ratio-content');
        auditRatioDiv.innerHTML = svg;

    } catch (error) {
        console.error("Error displaying audit ratio:", error);
        document.getElementById('audit-ratio-content').innerHTML = `<svg width="100%" height="100%"><text x="50%" y="50%" text-anchor="middle" fill="red">Error</text></svg>`;
    }
}



