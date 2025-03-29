document.getElementById('flightForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const airline = document.getElementById('airline').value;
    const flightNumber = document.getElementById('flight_number').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phone_number').value;

    checkFlightStatus(airline, flightNumber, email, phoneNumber);
});

function checkFlightStatus(airline, flightNumber, email, phoneNumber) {
    // Example API endpoint (replace with a real one)
    const apiUrl = `https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/${airline}/${flightNumber}?appId=YOUR_APP_ID&appKey=YOUR_APP_KEY`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const status = data.flightStatus.status;
            displayStatus(status);
            sendNotifications(status, email, phoneNumber);
        })
        .catch(error => {
            console.error('Error fetching flight status:', error);
            displayStatus('Error fetching flight status.');
        });
}

function displayStatus(status) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = `Current Flight Status: ${status}`;
}

function sendNotifications(status, email, phoneNumber) {
    // Email and SMS notifications can be sent via external services like Twilio or SendGrid
    // This is a placeholder - the actual implementation would require calling an API from the frontend
    alert(`Sending notifications to ${email} and ${phoneNumber}: Flight Status: ${status}`);
}
