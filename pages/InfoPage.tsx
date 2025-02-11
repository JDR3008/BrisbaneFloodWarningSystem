import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getWeather } from '@/scripts/weather';
import WeatherDisplay from '@/components/WeatherDisplay';
import { predictFlooding } from '@/scripts/api';
import FloodPredictionTimeline from '@/components/FloodPredictionTimeline';
import { useNavigation } from '@react-navigation/native';
import rainData from '@/scripts/FloodSimData';

/**
 * InfoPage is responsible for displaying the weather for the current dateand flood prediction data on the application.
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const InfoPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [floodData, setFloodData] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Call getWeather with brisbane as the location
        const data = await getWeather('Brisbane');
        setWeatherData(data);

        // Call predictFlooding with the sample rain data
        const prediction = await predictFlooding(rainData);
        setFloodData(prediction);
      } catch (error) {
        console.error('Error fetching weather data or predicting flooding:', error);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, alignSelf: 'center' }}>Weather & Flood Prediction</Text>
      {/* Display weather data */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {weatherData ? (
          <WeatherDisplay weatherData={weatherData} />
        ) : (
          <Text>Loading...</Text>
        )}
        {floodData.length > 0 && (
          <View style={styles.timelineContainer}>
            <FloodPredictionTimeline data={floodData} />
          </View>
        )}
      {/* Display flood prediction timeline */}
      </ScrollView>
      <TouchableOpacity style={styles.buttonContainer} onPress={navigation.goBack}>
        <Text style={styles.backButtonText}>Go back</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 80,
  },
  timelineContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 0,
  },
  buttonContainer: {
    backgroundColor: '#32CD32',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

});

export default InfoPage;