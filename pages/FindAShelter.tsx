import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../app/index"; // Import RootStackParamList
import { useNavigation, NavigationProp } from "@react-navigation/native";
import * as Location from 'expo-location';
import RNPickerSelect from 'react-native-picker-select';

// List of shelters to be presented on the map
const shelters = [
  { 
    phone: "1300 114 397", 
    address: "21 Anstey Street, Albion, QLD, 4010", 
    latitude: -27.430270, 
    longitude: 153.042470, 
    title: 'Anglicare Southern Queensland', 
    description: "Childcare, Counseling, Education, Employment, Health, Mental Health, Physical Health, Substance Abuse, Homeless Shelters, Family Shelters, Women’s Shelters, Youth Shelters, Housing, Maintenance, Rental Assistance, Utility Assistance" 
  },
  { 
    phone: "1300 236 822", 
    address: "122A William Street, Brisbane CBD, QLD, 4000", 
    latitude: -27.472300, 
    longitude: 153.023630, 
    title: 'Centacare', 
    description: "Childcare, Counseling, Education, Health, Mental Health, Physical Health, Homeless Shelters, Day Shelters, Transportation" 
  },
  { 
    phone: "(07) 3889 0063", 
    address: "865 Gympie Road, Lawnton, QLD, 4501", 
    latitude: -27.278550, 
    longitude: 152.982310, 
    title: 'Encircle', 
    description: "Childcare, Counseling, Education, Housing, Legal Assistance" 
  },
  // Add more points of interest as needed
];

// icons that are used
const icons = [
  { name: "phone", image: require("../assets/phone.png") },
  { name: "directions", image: require("../assets/directions.png")}
];

/**
 * The find a shelter page takes shelter information and displays it on the page. The user can order these in different ways and locate them
 * on the map when directed to the map page.
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const FindAShelter: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use typed navigation
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [sortedShelters, setSortedShelters] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState<string>("closest");

  /**
   * Handle when the user goes back to map page
   */
  const handleBack = () => {
    navigation.navigate("MapViewComponent");
  };

  /**
   * Function to calculate the distance between two coordinates
   * @param lat1 - latitude of point 1
   * @param lon1 - longitude of point 1
   * @param lat2 - latitude of point 2
   * @param lon2 - longitude of point 2
   * @returns {number} - the distance calculation based on the two points
   */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Earth radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon1 - lon2) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  /**
   * Sort shelters by closest distance
   * @param userLocation - the location of the user
   */
  const sortByDistance = (userLocation: Location.LocationObject) => {
    const { latitude, longitude } = userLocation.coords;
    const sorted = [...shelters].sort((a, b) => {
      const distanceA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distanceB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distanceA - distanceB;
    });
    setSortedShelters(sorted);
  };

  /**
   * Sort shelters by furthest distance
   * @param userLocation - the location of the user
   */
  const sortByFurthest = (userLocation: Location.LocationObject) => {
    const { latitude, longitude } = userLocation.coords;
    const sorted = [...shelters].sort((a, b) => {
      const distanceA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distanceB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distanceB - distanceA;
    });
    setSortedShelters(sorted);
  };

  /**
   * Sort shelters by alphabetical order
   */
  const sortByAlphabetical = () => {
    const sorted = [...shelters].sort((a, b) => a.title.localeCompare(b.title));
    setSortedShelters(sorted);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        sortByDistance(loc); // Default sorting by closest distance
      } else {
        console.log("Permission not granted");
      }
    })();
  }, []);

  /**
   * Handle sorting based on dropdown selection
   * @param value - the sorting which the user desires
   */
  const handleSortChange = (value: string) => {
    setSortOption(value);
    if (value === "closest" && location) {
      sortByDistance(location);
    } else if (value === "furthest" && location) {
      sortByFurthest(location);
    } else if (value === "alphabetical") {
      sortByAlphabetical();
    }
  };

  /**
   * Gets the phone number of the shelter that is being clicked on
   * @param phone - phone number of the shelter clicked
   */
  const showPhoneNumber = (phone: string) => {
    Alert.alert("Phone Number", phone);
  };

  /**
   * This function gets the relevant details of the shelter and navigates to the map page with this information.
   * The map page will navigate to the shelter that is clicked on this page.
   * @param item - shelter item
   */
  const handleDirectionsClick = (item: typeof shelters[0]) => {
    // Navigate to MapViewComponent and pass selectedPoint as a parameter
    navigation.navigate('MapViewComponent', {
      selectedPoint: {
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.title,
        description: item.description,
      },
    });
  };

  return (
    <View style={[styles.container, styles.background]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back-outline" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Shelters</Text>
      </View>

      {location ? (
        <>
          {/* Dropdown for sorting options */}
          <RNPickerSelect
            onValueChange={(value) => handleSortChange(value)}
            items={[
              { label: "Closest", value: "closest" },
              { label: "Furthest", value: "furthest" },
              { label: "Alphabetical", value: "alphabetical" },
            ]}
            style={pickerSelectStyles}
            value={sortOption}
            Icon={() => (
              <View>
                <Ionicons name="arrow-down" size={20} color="black" />
              </View>
            )}
          />

          {/* List of sorted shelters */}
          <FlatList
            data={sortedShelters}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => {
              // Calculate the distance for each shelter based on the user's location
              const distance = location ? calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                item.latitude,
                item.longitude
              ).toFixed(1) : 'Calculating...';

              return (
                <View style={styles.shelterItem}>
                  {/* Display the distance above the title */}
                  <Text style={styles.shelterDistance}>{distance} km away</Text>
                  <Text style={styles.shelterTitle}>{item.title}</Text>
                  <View style={styles.addressContainer}>
                    <Ionicons name="location-outline" size={20} color="black" />
                    <Text style={styles.shelterAddress}>{item.address}</Text>
                  </View>

                  {/* Buttons in the top-right corner */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => showPhoneNumber(item.phone)}>
                      <Image source={icons[0].image} style={styles.iconImage} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDirectionsClick(item)}>
                      <Image source={icons[1].image} style={styles.iconImage} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </>
      ) : (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 30,
  },
  backButton: {
    position: "absolute",
    left: 0,
    paddingLeft: 10,
  },
  title: {
    fontSize: 32,
  },
  shelterDistance: {
    fontSize: 16,
    color: "#35D346",
    marginBottom: 5,
    fontWeight: "bold",
  },
  shelterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    width: "70%"
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20
  },
  shelterAddress: {
    color: "#555",
  },
  shelterItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 10, 
    position: "relative", 
  },
  buttonContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: 100,
  },
  iconImage: {
    width: 40,
    height: 40,
    marginLeft: 10
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    textAlign: 'right',
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingRight: 20,
    marginBottom: 20
  },
  inputAndroid: {
    fontSize: 16,
    textAlign: 'right',
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingRight: 20,
  },
});

export default FindAShelter;
