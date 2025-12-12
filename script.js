const API_KEY = "f8395407633eca6f9512d8c9dff00b0f";

/* ------------------- DOM ------------------- */
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const themeToggle = document.getElementById("themeToggle");

const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");

const currentCard = document.getElementById("currentCard");
const currentIcon = document.getElementById("currentIcon");
const currentTemp = document.getElementById("currentTemp");
const currentDesc = document.getElementById("currentDesc");
const cityName = document.getElementById("cityName");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const updatedAt = document.getElementById("updatedAt");

const forecastSection = document.getElementById("forecastSection");
const forecastGrid = document.getElementById("forecastGrid");

const sourceLink = document.getElementById("sourceLink");
sourceLink.href = "https://openweathermap.org/current";

/* ----------------- helpers ------------------ */
function showLoader(show = true) {
  loader.hidden = !show;
  currentCard.hidden = show;
  forecastSection.hidden = show;
  errorBox.hidden = true;
}

function showError(msg) {
  errorBox.hidden = false;
  errorBox.textContent = msg;
  currentCard.hidden = true;
  forecastSection.hidden = true;
  loader.hidden = true;
}

function saveLastCity(city) {
  try { localStorage.setItem("weather_last_city", city); } catch(e){}
}
function getLastCity() {
  try { return localStorage.getItem("weather_last_city"); } catch(e){ return null; }
}

function formatTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

/* ----------------- API calls ---------------- */
async function fetchWeather(city) {
  showLoader(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found or invalid API key");
    const data = await res.json();
    renderWeather(data);
    saveLastCity(city);
  } catch (err) {
    showError(err.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  showLoader(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Unable to fetch weather for your location");
    const data = await res.json();
    renderWeather(data);
    saveLastCity(data.name);
  } catch (err) {
    showError(err.message);
  }
}

/* ----------------- Geolocation ---------------- */
function useMyLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation not supported by browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  }, () => {
    showError("Permission denied or unable to get location.");
  });
}

/* --------------- RENDER UI ----------------- */
function renderWeather(data) {
  currentIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  currentIcon.alt = data.weather[0].description;
  currentTemp.textContent = `${Math.round(data.main.temp)}°C`;
  currentDesc.textContent = data.weather[0].description;
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${data.wind.speed} m/s`;
  updatedAt.textContent = `Updated: ${formatTime(data.dt)}`;

  // --- 3-Day Mock Forecast ---
  const forecastData = [
    { day: "Tomorrow", icon: "01d", max: data.main.temp + 2, min: data.main.temp - 2, main: "Clear" },
    { day: "Day After", icon: "02d", max: data.main.temp + 3, min: data.main.temp - 1, main: "Clouds" },
    { day: "In 3 Days", icon: "03d", max: data.main.temp + 1, min: data.main.temp - 3, main: "Rain" }
  ];

  forecastGrid.innerHTML = "";
  forecastData.forEach(day => {
    const el = document.createElement("div");
    el.className = "forecast-card";
    el.innerHTML = `
      <div class="day">${day.day}</div>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.main}">
      <div class="range">${Math.round(day.max)}° / ${Math.round(day.min)}°</div>
      <div class="desc">${day.main}</div>
    `;
    forecastGrid.appendChild(el);
  });

  loader.hidden = true;
  currentCard.hidden = false;
  forecastSection.hidden = false;
}

/* ----------------- EVENTS -------------------- */
searchBtn.addEventListener("click", () => {
  const v = cityInput.value.trim();
  if (!v) return;
  fetchWeather(v);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

locBtn.addEventListener("click", useMyLocation);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  try {
    localStorage.setItem("weather_theme_dark", document.body.classList.contains("dark") ? "1" : "0");
  } catch(e){}
});

/* ----------------- INIT -------------------- */
function init() {
  // restore theme
  try {
    if (localStorage.getItem("weather_theme_dark") === "1") {
      document.body.classList.add("dark");
    }
  } catch(e){}

  const last = getLastCity();
  if (last) fetchWeather(last);
  else fetchWeather("Lahore"); // default city
}

init();
