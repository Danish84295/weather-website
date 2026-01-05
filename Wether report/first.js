const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const output = document.getElementById("weather-info");
const forecastOutput = document.getElementById("forecast-info");
const locationBtn = document.getElementById("location-btn");

const API_KEY = "bc8df83492a249d8a3e90255251911";

/**
 * Main function to fetch weather data from the API
 * @param {string} query - Can be a city name or "lat,lon" coordinates
 */
async function getWeatherData(query) {
    // Show loading state
    output.innerHTML = `<div class="placeholder-text">Fetching weather...</div>`;
    forecastOutput.innerHTML = "";

    // We use the 'forecast.json' endpoint to get both current and upcoming days
    const URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=3&aqi=no`;

    try {
        const response = await fetch(URL);
        const data = await response.json();

        if (data.error) {
            output.innerHTML = `<div class="placeholder-text" style="color: #ff8888;">${data.error.message}</div>`;
            return;
        }

        // 1. Update the Background Color based on Temperature
        updateBackground(data.current.temp_c);

        // 2. Display Current Weather
        output.innerHTML = `
            <div class="current-weather">
                <h2>${data.location.name}</h2>
                <p style="opacity: 0.8;">${data.location.country}</p>
                <img src="https:${data.current.condition.icon}" alt="weather-icon" width="100">
                <div class="temp-main">${Math.round(data.current.temp_c)}°</div>
                <p class="condition-text">${data.current.condition.text}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">
                    Humidity: ${data.current.humidity}% | Wind: ${data.current.wind_kph} km/h
                </p>
            </div>
        `;

        // 3. Display 3-Day Forecast
        let forecastHTML = "";
        data.forecast.forecastday.forEach(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            forecastHTML += `
                <div class="forecast-item">
                    <p style="font-weight: bold; margin-bottom: 5px;">${dayName}</p>
                    <img src="https:${day.day.condition.icon}" alt="icon">
                    <p>${Math.round(day.day.maxtemp_c)}°</p>
                    <p style="opacity: 0.6; font-size: 0.7rem;">${Math.round(day.day.mintemp_c)}°</p>
                </div>
            `;
        });
        forecastOutput.innerHTML = forecastHTML;

    } catch (err) {
        output.innerHTML = `<div class="placeholder-text" style="color: #ff8888;">Network error. Please try again.</div>`;
        console.error("Error:", err);
    }
}

/**
 * Changes the body gradient based on temperature
 */
function updateBackground(temp) {
    if (temp > 28) {
        // Hot weather (Warm Oranges)
        document.body.style.background = "linear-gradient(135deg, #f83600 0%, #f9d423 100%)";
    } else if (temp < 10) {
        // Cold weather (Icy Blues)
        document.body.style.background = "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)";
    } else {
        // Mild weather (Standard Blues)
        document.body.style.background = "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
    }
}

// Event Listener: Handle Search Form
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) getWeatherData(city);
});

// Event Listener: Handle Geolocation Button
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        output.innerHTML = `<div class="placeholder-text">Accessing GPS...</div>`;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const query = `${position.coords.latitude},${position.coords.longitude}`;
                getWeatherData(query);
            },
            (error) => {
                output.innerHTML = `<div class="placeholder-text" style="color: #ff8888;">Location access denied.</div>`;
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});