const geoUrl = "https://geocoding-api.open-meteo.com/v1/search";

// Get HTML elements
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchButton");

const place = document.getElementById("place");
const country = document.getElementById("country");

const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const dayNight = document.getElementById("dayNight");

const localTime = document.getElementById("localTime");
const localDate = document.getElementById("localDate");
const timeLocation = document.getElementById("timeLocation");

const status = document.getElementById("status");

let clockInterval = null;
let cityTimeZone = null;


// Search form event
searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    getWeather();
});


// Main weather function
async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        status.innerText = "Please enter a city name!";
        return;
    }

    try {

        status.innerText = "Searching for city...";
        searchBtn.disabled = true;

        // STEP 1: Get city coordinates

        const geoResponse = await fetch(
            `${geoUrl}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // STEP 2: Fetch weather data

        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        // STEP 3: Display city information

        place.innerText = location.name;

        country.innerText =
            `${location.admin1 ? location.admin1 + ", " : ""}${location.country}`;

        timeLocation.innerText =
            `Local time in ${location.name}, ${location.country}`;

        // STEP 4: Display temperature

        temperature.innerText =
            `${current.temperature_2m}°C`;

        // STEP 5: Display weather condition

        weatherDescription.innerText =
            getWeatherDescription(current.weather_code);

        weatherIcon.innerText =
            getWeatherIcon(current.weather_code);

        // STEP 6: Display other weather measurements

        feelsLike.innerText =
            `${current.apparent_temperature}°C`;

        humidity.innerText =
            `${current.relative_humidity_2m}%`;

        wind.innerText =
            `${current.wind_speed_10m} km/h`;

        pressure.innerText =
            `${current.surface_pressure} hPa`;

        dayNight.innerText =
            current.is_day ? "Day ☀️" : "Night 🌙";

        // STEP 7: Display local time of searched city

        cityTimeZone = weatherData.timezone;

        updateLocalTime();

        // Update clock every second

        if (clockInterval !== null) {
            clearInterval(clockInterval);
        }

        clockInterval = setInterval(updateLocalTime, 1000);

        status.innerText =
            `Showing live weather for ${location.name}, ${location.country}`;

    }

    catch (error) {

        status.innerText = error.message;

        place.innerText = "Weather unavailable";
        country.innerText = "";

        temperature.innerText = "--°C";
        weatherDescription.innerText = "Unable to load weather";
        weatherIcon.innerText = "❓";

        feelsLike.innerText = "--°C";
        humidity.innerText = "--%";
        wind.innerText = "-- km/h";
        pressure.innerText = "-- hPa";
        dayNight.innerText = "--";

        localTime.innerText = "--:--:--";
        localDate.innerText = "Time unavailable";
        timeLocation.innerText = "Search for a valid city";

        cityTimeZone = null;

        if (clockInterval !== null) {
            clearInterval(clockInterval);
            clockInterval = null;
        }

        console.error(error);

    }

    finally {

        searchBtn.disabled = false;

    }

}


// STEP 8: Update local clock

function updateLocalTime() {

    if (!cityTimeZone) return;

    const now = new Date();

    localTime.innerText = new Intl.DateTimeFormat("en-US", {
        timeZone: cityTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    }).format(now);

    localDate.innerText = new Intl.DateTimeFormat("en-US", {
        timeZone: cityTimeZone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(now);

}


// STEP 9: Weather descriptions

function getWeatherDescription(code) {

    const weatherCodes = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Slight Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        77: "Snow Grains",
        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Slight Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Heavy Thunderstorm with Hail"
    };

    return weatherCodes[code] || "Unknown Weather";

}


// STEP 10: Weather icons

function getWeatherIcon(code) {

    const weatherIcons = {
        0: "☀️",
        1: "🌤️",
        2: "⛅",
        3: "☁️",
        45: "🌫️",
        48: "🌫️",
        51: "🌦️",
        53: "🌦️",
        55: "🌧️",
        61: "🌧️",
        63: "🌧️",
        65: "🌧️",
        71: "❄️",
        73: "❄️",
        75: "❄️",
        77: "❄️",
        80: "🌦️",
        81: "🌧️",
        82: "⛈️",
        85: "❄️",
        86: "❄️",
        95: "⛈️",
        96: "⛈️",
        99: "⛈️"
    };

    return weatherIcons[code] || "🌤️";

}