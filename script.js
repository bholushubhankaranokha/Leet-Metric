document.addEventListener("DOMContentLoaded", function () {

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-lable");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatesContainer = document.querySelector(".stats-cards")

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        const url = `https://leetcode-stats-api.herokuapp.com/${username}`
        try {
            searchButton.textContent = "🔍 Searching..."
            searchButton.disabled = true;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Unable to fatch details");
            }
            const data = await response.json();
            console.log("Login data", data);
        }
        catch(error){
            statsContainer.innerHTML=`<p>Data Not Found</p>`
        }
        finally{
            searchButton.textContent = "🔍 Search"
            searchButton.disabled = false;
        }
    }

    searchButton.addEventListener('click', function () {
        const username = usernameInput.value;
        console.log("Login username:", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    })
})