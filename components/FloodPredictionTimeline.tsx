import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Get the screen width
const { width: screenWidth } = Dimensions.get('window');

interface FloodPrediction {
  date: string;
  prediction: number;
}

interface FloodPredictionTimelineProps {
  data: FloodPrediction[];
}

/**
 * FloodPredictionTimeline is responsible for displaying the flood prediction data on the application.
 * @param data - the flood data that is passed through in order to send notifications to the user
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const FloodPredictionTimeline: React.FC<FloodPredictionTimelineProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter to get the last 7 days of data
  const last7Days = data.slice(-7);

  /**
   * getIconForPrediction is responsible for displaying the icon for the flood prediction data on the application.
   * @param prediction - the prediction of the flood for a given date (range 0-3)
   * @returns This returns the icon for the flood prediction data on the application.
   */
  const getIconForPrediction = (prediction: number) => {
    switch (prediction) {
      case 0:
        return <Icon name="check-circle" size={30} color="green" />;
      case 1:
        return <Icon name="warning" size={30} color="yellow" />;
      case 2:
        return <Icon name="error" size={30} color="orange" />;
      case 3:
        return <Icon name="report-problem" size={30} color="red" />;
      default:
        return <Icon name="help" size={30} color="grey" />;
    }
  };

  /**
   * getBackgroundColorForPrediction is responsible for displaying the background color for the flood prediction data on the application.
   * @param prediction - the prediction of the flood for a given date (range 0-3)
   * @returns This returns the background color for the flood prediction data on the application.
   */
  const getBackgroundColorForPrediction = (prediction: number) => {
    switch (prediction) {
      case 0:
        return '#d4edda';
      case 1:
        return '#fff3cd';
      case 2:
        return '#ffeeba';
      case 3:
        return '#f8d7da';
      default:
        return '#f0f0f0';
    }
  };

  /**
   * getDescriptionForPrediction is responsible for displaying the description for the flood prediction data on the application.
   * @param prediction - the prediction of the flood for a given date (range 0-3)
   * @param date - the date of the flood prediction
   * @returns This returns the description for the flood prediction data on the application.
   */
  const getDescriptionForPrediction = (prediction: number, date: string) => {
    switch (prediction) {
      case 0:
        return 'No flooding is expected on this day.';
      case 1:
        return `Minor flooding is present on ${date}. Please avoid red areas on the flood map.`;
      case 2:
        return `Moderate flooding is present on ${date}. Please avoid red and orange areas on the flood map.`;
      case 3:
        return `Major flooding is present on ${date}. Please avoid all areas on the flood map.`;
      default:
        return 'No prediction available for this day.';
    }
  }

  /**
   * handleScroll is responsible for handling the scroll event for the flood prediction data on the application.
   * @param event - the scroll event
   * @returns This returns the index of the flood prediction data on the application.
   */
  const handleScroll = (event: any) => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  /**
   * formatDate is responsible for formatting the date of the flood prediction data on the application.
   * @param date - the date of the flood prediction
   * @returns This returns the formatted date of the flood prediction data on the application.
   */
  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  return (
    <View>
      {/* Timeline */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.timelineContainer}
      >
        {last7Days.map((item, index) => (
          <View
            key={index}
            style={[
              styles.timelineItem,
              { backgroundColor: getBackgroundColorForPrediction(item.prediction) },
            ]}
          >
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            {getIconForPrediction(item.prediction)}
            <Text style={{ color: '#333', marginTop: 10, marginHorizontal: 10 }}>
              {getDescriptionForPrediction(item.prediction, item.date)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Indicator */}
      <View style={styles.paginationContainer}>
        {last7Days.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { opacity: index === currentIndex ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    paddingVertical: 20,
  },
  timelineItem: {
    width: screenWidth-(screenWidth*0.1),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: screenWidth*0.05,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
});

export default FloodPredictionTimeline;
