// Event listener for form submission
document.getElementById('flightForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const airline = document.getElementById('airline').value;
    const flightNumber = document.getElementById('flight_number').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phone_number').value;

    const notifyEmail = document.getElementById('emailNotify').checked;
    const notifySMS = document.getElementById('smsNotify').checked;
    const notifyCall = document.getElementById('callNotify').checked;

    // Validate form based on the user's selection
    if ((notifyEmail && !email) || (notifySMS || notifyCall) && !phoneNumber) {
        alert('Please provide the required contact details.');
        return;
    }

    // Check flight status and send notifications
    checkFlightStatus(airline, flightNumber, email, phoneNumber, notifyEmail, notifySMS, notifyCall);
});

// Function to handle flight status check
function checkFlightStatus(airline, flightNumber, email, phoneNumber, notifyEmail, notifySMS, notifyCall) {
    const apiUrl = `https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/${airline}/${flightNumber}?appId=YOUR_APP_ID&appKey=YOUR_APP_KEY`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const status = data.flightStatus.status;
            displayStatus(status);
            if (notifyEmail) {
                sendEmailNotification(status, email);
            }
            if (notifySMS || notifyCall) {
                sendSMSOrCallNotification(status, phoneNumber);
            }
        })
        .catch(error => {
            console.error('Error fetching flight status:', error);
            displayStatus('Error fetching flight status.');
        });
}

// Display flight status on the page
function displayStatus(status) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = `Current Flight Status: ${status}`;
}

// Simulate sending email notification
function sendEmailNotification(status, email) {
    alert(`Email sent to ${email}: Flight Status: ${status}`);
    // Integrate with actual email service (e.g., SendGrid, etc.)
}

// Simulate sending SMS or call notification
function sendSMSOrCallNotification(status, phoneNumber) {
    alert(`SMS/Call sent to ${phoneNumber}: Flight Status: ${status}`);
    // Integrate with actual SMS/Phone Call service (e.g., Twilio)
}

// Show or hide email/phone fields based on user selection
document.getElementById('emailNotify').addEventListener('change', toggleFields);
document.getElementById('smsNotify').addEventListener('change', toggleFields);
document.getElementById('callNotify').addEventListener('change', toggleFields);

function toggleFields() {
    const emailLabel = document.getElementById('emailLabel');
    const emailField = document.getElementById('email');
    const phoneLabel = document.getElementById('phoneLabel');
    const phoneField = document.getElementById('phone_number');

    // Show/hide fields based on checkboxes
    if (document.getElementById('emailNotify').checked) {
        emailLabel.style.display = 'block';
        emailField.style.display = 'block';
    } else {
        emailLabel.style.display = 'none';
        emailField.style.display = 'none';
    }

    if (document.getElementById('smsNotify').checked || document.getElementById('callNotify').checked) {
        phoneLabel.style.display = 'block';
        phoneField.style.display = 'block';
    } else {
        phoneLabel.style.display = 'none';
        phoneField.style.display = 'none';
    }
}
