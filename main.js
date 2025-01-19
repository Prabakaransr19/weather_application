// Get references to DOM elements
let cityInput = document.getElementById('city-input'); // Input field for city name
let searchBtn = document.getElementById('searchbtn'); // Button to search weather for entered city
let locationBtn = document.getElementById('locationbtn'); // Button to get weather for current location

// API key for OpenWeatherMap
let api_key = 'db79a9b6323b7c4a29ed5d50735feff8',

// Weather-related DOM elements
currentWeatherCard = document.querySelectorAll('.weather-left .card')[0], // Current weather display
fiveDaysForecastCard = document.querySelector('.day-forcast'), // 5-day forecast display
aqiCard = document.querySelectorAll('.highlights .card')[0], // Air Quality Index card
sunriseCard = document.querySelectorAll('.highlights .card')[1], // Sunrise & Sunset card

// Other DOM elements for displaying values
humidityVal = document.querySelector('#humidityValue'), // Humidity value
pressureVal = document.querySelector('#pressureValue'), // Pressure value
visibilityVal = document.querySelector('#visibilityValue'), // Visibility value
windspeedVal = document.querySelector('#windspeedValue'), // Wind speed value

// Array of Air Quality Index (AQI) descriptions
aqilist = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

// Function to fetch weather details using city or coordinates
function getWeatherDetails(name, lat, lon, country, state) {
    // API endpoints for forecast, current weather, and air pollution data
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
        AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,

        // Arrays for days and months for date formatting
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fetch air pollution data
    fetch(AIR_POLLUTION_API_URL)
        .then(res => res.json())
        .then(data => {
            let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components; // Extract pollutants
            aqiCard.innerHTML = `
                <div class="card-head">
                    <p>Air Quality Index</p>
                    <p class="air-index aqi-${data.list[0].main.aqi}">${aqilist[data.list[0].main.aqi - 1]}</p>
                </div>
                <div class="air-indices">
                    <!-- Display pollutant data -->
                    <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
                    <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
                    <div class="item"><p>SO2</p><h2>${so2}</h2></div>
                    <div class="item"><p>CO</p><h2>${co}</h2></div>
                    <div class="item"><p>NO</p><h2>${no}</h2></div>
                    <div class="item"><p>NO2</p><h2>${no2}</h2></div>
                    <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
                    <div class="item"><p>O3</p><h2>${o3}</h2></div>
                </div>`;
        })
        .catch(() => alert('Air pollution data fetch failed'));

    // Fetch current weather data
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            let date = new Date(); // Get current date
            currentWeatherCard.innerHTML = `
                <div class="current-weather">
                    <div class="details">
                        <p>Now</p>
                        <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                        <p>${data.weather[0].description}</p>
                    </div>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]}, ${date.getFullYear()}</p>
                    <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
                </div>`;
            
            // Extract additional details
            let { sunrise, sunset } = data.sys,
                { timezone, visibility } = data,
                { humidity, pressure } = data.main,
                { speed } = data.wind;

            // Format sunrise and sunset times
            let sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
                sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');
            
            sunriseCard.innerHTML = `
                <div class="card-head">
                    <p>Sunrise & Sunset</p>
                </div>
                <div class="sunrise-sunset">
                    <div class="item"><p>Sunrise</p><h2>${sRiseTime}</h2></div>
                    <div class="item"><p>Sunset</p><h2>${sSetTime}</h2></div>
                </div>`;
            
            // Update other weather details
            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure}hPa`;
            visibilityVal.innerHTML = `${visibility / 1000}km`;
            windspeedVal.innerHTML = `${speed}m/s`;
        })
        .catch(() => alert('Failed to fetch current data'));

    // Fetch 5-day forecast data
    fetch(FORECAST_API_URL)
        .then(res => res.json())
        .then(data => {
            let uniqueForecastDays = [];
            let fiveDaysForecast = data.list.filter(forecast => {
                let forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            fiveDaysForecastCard.innerHTML = ''; // Clear existing content
            for (let i = 1; i < fiveDaysForecast.length; i++) {
                let date = new Date(fiveDaysForecast[i].dt_txt);
                fiveDaysForecastCard.innerHTML += `
                    <div class="forcast-item">
                        <div class="icon-wrapper">
                            <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="Forecast Icon">
                            <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                        </div>
                        <p>${date.getDate()}, ${months[date.getMonth()]}</p>
                        <p>${days[date.getDay()]}</p>
                    </div>`;
            }
        })
        .catch(() => alert('Failed to fetch forecast data'));
}

// Function to get city coordinates from user input
function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    cityInput.value = ''; // Clear input field
    if (!cityName) return;

    let GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            let { name, lat, lon, country, state } = data[0];
            getWeatherDetails(name, lat, lon, country, state);
        })
        .catch(() => alert(`Can't fetch details of ${cityName}`));
}

// Event listener for the search button
searchBtn.addEventListener('click', getCityCoordinates);

// Event listener for the location button to get user's coordinates
locationBtn.addEventListener('click', getuserCoordinates);

// Function to get user's current location
function getuserCoordinates() {
    navigator.geolocation.getCurrentPosition(
        position => {
            let { latitude, longitude } = position.coords;
            let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    let { name, country, state } = data[0];
                    getWeatherDetails(name, latitude, longitude, country, state);
                })
                .catch(() => alert('Cannot find current location'));
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Allow location access");
            }
        }
    );
}
