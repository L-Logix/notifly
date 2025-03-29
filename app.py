from flask import Flask, render_template, request, redirect, url_for
import requests
from bs4 import BeautifulSoup
import smtplib
from twilio.rest import Client
import time
from threading import Thread

app = Flask(__name__)

# Email and Twilio credentials (use environment variables for production)
SENDER_EMAIL = 'your_email@gmail.com'
SENDER_PASSWORD = 'your_email_password'

TWILIO_SID = 'your_twilio_sid'
TWILIO_AUTH_TOKEN = 'your_twilio_auth_token'
TWILIO_PHONE_NUMBER = 'your_twilio_phone_number'

# Flight status URL (e.g., for FlightStats, this is an example)
FLIGHT_STATUS_URL = 'https://www.flightstats.com/v2/flight-tracker/{airline}/{flight_number}'

# Function to scrape flight status (delays, cancellations, etc.)
def get_flight_status(airline, flight_number):
    url = FLIGHT_STATUS_URL.format(airline=airline, flight_number=flight_number)
    response = requests.get(url)
    if response.status_code != 200:
        return None

    soup = BeautifulSoup(response.text, 'html.parser')
    status_tag = soup.find('div', class_='status')  # Update according to the actual page's HTML structure
    if status_tag:
        status = status_tag.get_text().strip()
        return status
    return None

# Function to send an email notification
def send_email(recipient_email, subject, message):
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()  # Secure connection
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            email_message = f"Subject: {subject}\n\n{message}"
            server.sendmail(SENDER_EMAIL, recipient_email, email_message)
    except Exception as e:
        print(f"Failed to send email: {e}")

# Function to send an SMS using Twilio
def send_sms(phone_number, message):
    client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
    try:
        client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
    except Exception as e:
        print(f"Failed to send SMS: {e}")

# Background thread to monitor flight status
def monitor_flight_status(airline, flight_number, email, phone_number):
    last_status = None
    while True:
        current_status = get_flight_status(airline, flight_number)
        
        if current_status:
            if current_status != last_status:
                subject = f"Flight {flight_number} Status Update"
                message = f"Your flight {flight_number} is now {current_status}."
                send_email(email, subject, message)
                send_sms(phone_number, message)
                last_status = current_status
        
        time.sleep(60)  # Wait for 1 minute before checking again

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        airline = request.form["airline"]
        flight_number = request.form["flight_number"]
        email = request.form["email"]
        phone_number = request.form["phone_number"]
        
        # Start the background thread to monitor the flight status
        thread = Thread(target=monitor_flight_status, args=(airline, flight_number, email, phone_number))
        thread.daemon = True  # Allow the thread to exit when the app exits
        thread.start()
        
        return redirect(url_for("index"))
    
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
