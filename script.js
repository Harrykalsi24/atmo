// Weather App JavaScript

class WeatherApp {
    constructor() {
        this.API_KEY = '953979d4a8d50f33ff60ec66d2d0edc6';
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.currentWeather = null;
        this.forecast = null;
        this.loading = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.getCurrentLocation();
    }

    bindEvents() {
        const searchForm = document.getElementById('search-form');
        const locationButton = document.getElementById('location-button');

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            const city = searchInput.value.trim();
            if (city) {
                this.fetchWeatherByCity(city);
            }
        });

        locationButton.addEventListener('click', () => {
            this.getCurrentLocation();
        });
    }

    setLoading(isLoading) {
        this.loading = isLoading;
        const loadingSpinner = document.getElementById('loading-spinner');
        const searchIcon = document.getElementById('search-icon');
        const loadingIcon = document.getElementById('loading-icon');
        const searchButton = document.getElementById('search-button');
        const locationButton = document.getElementById('location-button');
        const searchInput = document.getElementById('search-input');

        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
            searchIcon.classList.add('hidden');
            loadingIcon.classList.remove('hidden');
            searchButton.disabled = true;
            locationButton.disabled = true;
            searchInput.disabled = true;
        } else {
            loadingSpinner.classList.add('hidden');
            searchIcon.classList.remove('hidden');
            loadingIcon.classList.add('hidden');
            searchButton.disabled = false;
            locationButton.disabled = false;
            searchInput.disabled = false;
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    hideWelcomeMessage() {
        document.getElementById('welcome-message').classList.add('hidden');
    }

    showWeatherContent() {
        document.getElementById('weather-content').classList.remove('hidden');
        this.hideWelcomeMessage();
    }

    async fetchWeatherByLocation(lat, lon) {
        if (!this.API_KEY) {
            this.showError('API key not provided. Please add your OpenWeatherMap API key.');
            return;
        }

        this.setLoading(true);

        try {
            // Fetch current weather
            const weatherResponse = await fetch(
                `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );
            
            if (!weatherResponse.ok) {
                throw new Error('Failed to fetch weather data');
            }
            
            const weatherData = await weatherResponse.json();

            // Fetch 5-day forecast
            const forecastResponse = await fetch(
                `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );
            
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            
            const forecastData = await forecastResponse.json();

            this.currentWeather = weatherData;
            this.forecast = forecastData;
            
            this.updateWeatherDisplay();
            this.updateBackground();
            this.updateWeatherAnimations();
            this.showWeatherContent();

        } catch (err) {
            this.showError(err.message || 'An error occurred');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchWeatherByCity(city) {
        if (!this.API_KEY) {
            this.showError('API key not provided. Please add your OpenWeatherMap API key.');
            return;
        }

        this.setLoading(true);

        try {
            // Fetch current weather
            const weatherResponse = await fetch(
                `${this.BASE_URL}/weather?q=${city}&appid=${this.API_KEY}&units=metric`
            );
            
            if (!weatherResponse.ok) {
                throw new Error('City not found');
            }
            
            const weatherData = await weatherResponse.json();

            // Fetch 5-day forecast
            const forecastResponse = await fetch(
                `${this.BASE_URL}/forecast?q=${city}&appid=${this.API_KEY}&units=metric`
            );
            
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            
            const forecastData = await forecastResponse.json();

            this.currentWeather = weatherData;
            this.forecast = forecastData;
            
            this.updateWeatherDisplay();
            this.updateBackground();
            this.updateWeatherAnimations();
            this.showWeatherContent();

        } catch (err) {
            this.showError(err.message || 'An error occurred');
        } finally {
            this.setLoading(false);
        }
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.fetchWeatherByLocation(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                this.showError('Unable to retrieve your location');
                // Default to London if location access is denied
                this.fetchWeatherByCity('London');
            }
        );
    }

    getWeatherIcon(weatherId, isDay = true) {
        if (weatherId >= 200 && weatherId < 300) {
            return '⚡'; // Thunderstorm
        } else if (weatherId >= 300 && weatherId < 600) {
            return '🌧️'; // Rain/Drizzle
        } else if (weatherId >= 600 && weatherId < 700) {
            return '❄️'; // Snow
        } else if (weatherId >= 700 && weatherId < 800) {
            return '🌫️'; // Atmosphere (mist, smoke, haze, etc.)
        } else if (weatherId === 800) {
            return isDay ? '☀️' : '🌙'; // Clear sky
        } else if (weatherId === 801) {
            return isDay ? '⛅' : '☁️'; // Few clouds
        } else if (weatherId === 802 || weatherId === 803) {
            return '☁️'; // Scattered/broken clouds
        } else if (weatherId === 804) {
            return '☁️'; // Overcast clouds
        }
        
        return isDay ? '☀️' : '🌙'; // Default
    }

    getTemperatureColor(temp) {
        if (temp <= 0) return 'text-blue-300';
        if (temp <= 10) return 'text-blue-200';
        if (temp <= 20) return 'text-green-300';
        if (temp <= 30) return 'text-yellow-300';
        return 'text-red-400';
    }

    getWeatherBackground(weatherMain) {
        const app = document.getElementById('app');
        app.className = app.className.replace(/from-\w+-\d+|to-\w+-\d+/g, '');
        
        switch (weatherMain.toLowerCase()) {
            case 'clear':
                app.classList.add('from-blue-400', 'to-blue-600');
                break;
            case 'clouds':
                app.classList.add('from-gray-400', 'to-gray-600');
                break;
            case 'rain':
            case 'drizzle':
                app.classList.add('from-gray-500', 'to-blue-700');
                break;
            case 'thunderstorm':
                app.classList.add('from-gray-800', 'to-purple-900');
                break;
            case 'snow':
                app.classList.add('from-blue-200', 'to-blue-400');
                break;
            case 'mist':
            case 'fog':
            case 'haze':
                app.classList.add('from-gray-300', 'to-gray-500');
                break;
            default:
                app.classList.add('from-blue-400', 'to-purple-600');
        }
    }

    formatTime(timestamp, timezone) {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    isDay(currentTime, sunrise, sunset) {
        return currentTime >= sunrise && currentTime <= sunset;
    }

    updateWeatherDisplay() {
        if (!this.currentWeather) return;

        this.updateCurrentWeather();
        this.updateForecast();
    }

    updateCurrentWeather() {
        const weather = this.currentWeather;
        const currentWeatherDiv = document.getElementById('current-weather');
        const isCurrentlyDay = this.isDay(weather.dt, weather.sys.sunrise, weather.sys.sunset);
        const icon = this.getWeatherIcon(weather.weather[0].id, isCurrentlyDay);
        const tempColor = this.getTemperatureColor(weather.main.temp);

        currentWeatherDiv.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-2xl font-semibold text-white">
                        ${weather.name}, ${weather.sys.country}
                    </h1>
                    <p class="text-gray-300 capitalize">
                        ${weather.weather[0].description}
                    </p>
                </div>
                <div class="animate-float text-4xl">
                    ${icon}
                </div>
            </div>

            <div class="flex items-center justify-between mb-6">
                <div>
                    <div class="text-5xl font-light ${tempColor} mb-2">
                        ${Math.round(weather.main.temp)}°C
                    </div>
                    <div class="text-gray-300 text-sm">
                        Feels like ${Math.round(weather.main.feels_like)}°C
                    </div>
                </div>
                <div class="text-right text-gray-300 text-sm">
                    <div>High: ${Math.round(weather.main.temp_max)}°C</div>
                    <div>Low: ${Math.round(weather.main.temp_min)}°C</div>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                    <div class="text-blue-400 mb-1">👁️</div>
                    <div class="text-white text-sm font-medium">
                        ${weather.visibility ? `${(weather.visibility / 1000).toFixed(1)}km` : 'N/A'}
                    </div>
                    <div class="text-gray-300 text-xs">Visibility</div>
                </div>
                
                <div class="text-center">
                    <div class="text-blue-400 mb-1">💧</div>
                    <div class="text-white text-sm font-medium">${weather.main.humidity}%</div>
                    <div class="text-gray-300 text-xs">Humidity</div>
                </div>
                
                <div class="text-center">
                    <div class="text-blue-400 mb-1">💨</div>
                    <div class="text-white text-sm font-medium">
                        ${weather.wind.speed.toFixed(1)} m/s
                    </div>
                    <div class="text-gray-300 text-xs">
                        ${weather.wind.deg ? this.getWindDirection(weather.wind.deg) : 'Wind'}
                    </div>
                </div>
                
                <div class="text-center">
                    <div class="text-blue-400 mb-1">📊</div>
                    <div class="text-white text-sm font-medium">${weather.main.pressure} hPa</div>
                    <div class="text-gray-300 text-xs">Pressure</div>
                </div>
            </div>

            <div class="flex justify-between mt-6 pt-4 border-t border-white/10">
                <div class="text-center">
                    <div class="text-yellow-400 mb-1">🌅</div>
                    <div class="text-white text-sm">
                        ${this.formatTime(weather.sys.sunrise, weather.timezone)}
                    </div>
                    <div class="text-gray-300 text-xs">Sunrise</div>
                </div>
                <div class="text-center">
                    <div class="text-orange-400 mb-1">🌇</div>
                    <div class="text-white text-sm">
                        ${this.formatTime(weather.sys.sunset, weather.timezone)}
                    </div>
                    <div class="text-gray-300 text-xs">Sunset</div>
                </div>
            </div>
        `;
    }

    updateForecast() {
        if (!this.forecast) return;

        const forecastList = document.getElementById('forecast-list');
        // Get daily forecasts (one per day, using noon data)
        const dailyForecasts = this.forecast.list.filter((item, index) => 
            index % 8 === 4 || index === 0
        ).slice(0, 5);

        forecastList.innerHTML = dailyForecasts.map((item, index) => {
            const icon = this.getWeatherIcon(item.weather[0].id);
            const tempColor = this.getTemperatureColor(item.main.temp);
            
            return `
                <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div class="flex items-center space-x-3">
                        <div class="text-blue-400 text-xl">${icon}</div>
                        <div>
                            <div class="text-white font-medium">
                                ${index === 0 ? 'Today' : this.formatDate(item.dt_txt)}
                            </div>
                            <div class="text-gray-300 text-sm capitalize">
                                ${item.weather[0].description}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="text-gray-300 text-sm">
                            💧 ${item.main.humidity}%
                        </div>
                        <div class="text-lg font-medium ${tempColor}">
                            ${Math.round(item.main.temp)}°
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateBackground() {
        if (this.currentWeather) {
            this.getWeatherBackground(this.currentWeather.weather[0].main);
        }
    }

    updateWeatherAnimations() {
        const animationsContainer = document.getElementById('weather-animations');
        animationsContainer.innerHTML = '';

        if (!this.currentWeather) return;

        const weatherMain = this.currentWeather.weather[0].main;

        if (weatherMain === 'Rain' || weatherMain === 'Drizzle') {
            // Create rain animation
            for (let i = 0; i < 50; i++) {
                const raindrop = document.createElement('div');
                raindrop.className = 'rain-animation';
                raindrop.style.left = `${Math.random() * 100}%`;
                raindrop.style.animationDelay = `${Math.random() * 2}s`;
                animationsContainer.appendChild(raindrop);
            }
        } else if (weatherMain === 'Snow') {
            // Create snow animation
            for (let i = 0; i < 30; i++) {
                const snowflake = document.createElement('div');
                snowflake.className = 'snow-animation';
                snowflake.style.left = `${Math.random() * 100}%`;
                snowflake.style.animationDelay = `${Math.random() * 3}s`;
                animationsContainer.appendChild(snowflake);
            }
        } else if (weatherMain === 'Clouds') {
            // Create cloud animation
            const clouds = ['☁️', '☁️', '☁️'];
            clouds.forEach((cloud, index) => {
                const cloudDiv = document.createElement('div');
                cloudDiv.className = 'cloud-animation';
                cloudDiv.innerHTML = cloud;
                cloudDiv.style.top = `${10 + index * 10}%`;
                cloudDiv.style.fontSize = index === 1 ? '2rem' : '3rem';
                cloudDiv.style.animationDelay = `${index * 5}s`;
                animationsContainer.appendChild(cloudDiv);
            });
        }
    }
}

// Initialize the weather app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
