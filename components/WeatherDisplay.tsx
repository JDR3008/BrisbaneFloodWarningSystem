import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * 
 * @param param0 weather data
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const WeatherDisplay: React.FC<{ weatherData: any }> = ({ weatherData }) => {
  const {
    main: { temp, feels_like, temp_min, temp_max, humidity, pressure },
    weather,
    wind: { speed, deg },
    name,
    sys: { country },
  } = weatherData;

  /**
   * Convert temperature from Kelvin to Celsius
   * @param kelvin - temperature in Kelvin
   * @returns {number} - temperature in celcius
   */
  const convertToCelsius = (kelvin: number) => (kelvin - 273.15).toFixed(1);

  return (
    <View style={styles.container}>
      <Text style={styles.locationText}>{name}, {country}</Text>
      {/* Weather information */}
      <View style={styles.weatherInfoContainer}>
        <Icon name="weather-partly-cloudy" size={80} color="#ff4500" />
        <Text style={styles.temperatureText}>{convertToCelsius(temp)}°C</Text>
        <Text style={styles.weatherDescription}>{weather[0].description}</Text>
      </View>
      {/* Weather details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="thermometer" size={24} color="#004d66" />
          <Text style={styles.detailLabel}>Feels Like:</Text>
          <Text style={styles.detailValue}>{convertToCelsius(feels_like)}°C</Text>
        </View>
        {/* Min/Max temperature */}
        <View style={styles.detailRow}>
          <Icon name="thermometer-lines" size={24} color="#004d66" />
          <Text style={styles.detailLabel}>Min / Max:</Text>
          <Text style={styles.detailValue}>{convertToCelsius(temp_min)}°C / {convertToCelsius(temp_max)}°C</Text>
        </View>
        {/* Humidity */}
        <View style={styles.detailRow}>
          <Icon name="water-percent" size={24} color="#004d66" />
          <Text style={styles.detailLabel}>Humidity:</Text>
          <Text style={styles.detailValue}>{humidity}%</Text>
        </View>
        {/* Pressure */}
        <View style={styles.detailRow}>
          <Icon name="gauge" size={24} color="#004d66" />
          <Text style={styles.detailLabel}>Pressure:</Text>
          <Text style={styles.detailValue}>{pressure} hPa</Text>
        </View>
        {/* Wind */}
        <View style={styles.detailRow}>
          <Icon name="weather-windy" size={24} color="#004d66" />
          <Text style={styles.detailLabel}>Wind:</Text>
          <Text style={styles.detailValue}>{speed} m/s at {deg}°</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e8f4f8',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    width: '90%',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#b0c4de',
  },
  locationText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#004d66',
    marginBottom: 12,
  },
  weatherInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  temperatureText: {
    fontSize: 54,
    fontWeight: '700',
    color: '#ff4500',
  },
  weatherDescription: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#666',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 16,
    color: '#004d66',
    fontWeight: '500',
    marginLeft: 10,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 'auto',
  },
});

export default WeatherDisplay;
