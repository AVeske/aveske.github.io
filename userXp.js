async function fetchUserXpData(userId){
    const query = `
    query GetUserXpData($userId: Int!) {
        xp_view(where: { userId: { _eq: $userId } }) {
            amount
            userId
            path
        }
    }`;

    const response= await fetch("https://01.kood.tech/api/graphql-engine/v1/graphql",{
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
    if (!data.data || !data.data.xp_view || data.data.xp_view.length === 0) {
        console.error("User data not found in the response:", data);
        throw new Error("Result data is undefined");
    }

    return data.data.xp_view;
}

function processUserXpData(resultData) {
    let userXPData = 0;

    resultData.forEach(result => {
        const path = result.path;

        if (path.startsWith('/johvi/piscine-go/') || path.startsWith('/johvi/div-01/piscine-js/')) {
            return;
        } else {
            userXPData += result.amount;
        }
    });

    return (userXPData / 1000).toFixed(0); // Convert to KB and round off
}

async function displayUserXp() {
    const userXpText = document.getElementById("xp-text"); // Updated target
    try {
        const userId = await fetchUserId();
        const xpData = await fetchUserXpData(userId);
        const userXP = processUserXpData(xpData);
        console.log("Total XP for user: ", userXP);
        userXpText.textContent = `Total XP: ${userXP} KB`; // Use the new <p> element
    } catch (error) {
        console.error("Error fetching user XP:", error);
    }
}
