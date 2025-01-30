import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;


  constructor(city:string, date:string, icon: string, iconDescription:string, tempF:number, windSpeed:number, humidity:number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.WEATHER_API_KEY || '';
  }

  private async fetchLocationData(query: string): Promise<any> {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`);
    
    if (!response.ok) throw new Error('Failed to fetch location data');
    return response.json();
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
  }

  private parseCurrentWeather(response: any): Weather[] {
    const weatherArray = [];
    for (let i = 0; i < response.list.length; i++) {
      if (i%8 === 0) {
       
        weatherArray.push(new Weather(
          response.city.name,
          dayjs(response.list[i].dt_txt).format('dddd, MMMM D, YYYY'),
          response.list[i].weather[0].icon,
          response.list[i].weather[0].description,
          Math.round((response.list[i].main.temp - 273.15) * 9/5 + 32),
          response.list[i].wind.speed,
          response.list[i].main.humidity
        ));
      }
    }
   
      return weatherArray;

  }

  public async getWeatherforCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    
    return this.parseCurrentWeather(weatherData);
  }
}

export default new WeatherService();