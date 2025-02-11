// Hardcoded api key for convenience, would be stored in .env file in a production environment
const APIKey = "5fbd4f888cc555b162748e6e02814f39"

// Function that will fetch the weather data from the API and export the data to be used in InfoPage.tsx
export const getWeather = async (city: string) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`)
    const data = await response.json()
    console.log(data);
    return data
}


