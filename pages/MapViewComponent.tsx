import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  PanResponder, 
  Animated, 
  TextInput, 
  ScrollView, 
  Alert, 
  FlatList,
  Image 
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { predictFlooding } from '@/scripts/api';
import NotificationComponent from '@/components/NotificationComponent';
import rainData from '@/scripts/FloodSimData';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Navigation from '@/components/Navigation';
import { auth, database } from '../firebaseConfig';
import { ref, onValue, push, get } from 'firebase/database';
import axios from 'axios';
import NotificationsPopup from '../components/NotificationsPopup';
import { useRoute } from '@react-navigation/native';




const GOOGLE_MAPS_APIKEY = 'AIzaSyB5QACGchCem1oFqlkmx0fmXkHHUulxQUk';



// List of shelters to be presented on the map
const shelters = [
  { latitude: -27.430270, longitude: 153.042470, title: 'Anglicare Southern Queensland', description: "Childcare, Counseling, Education, Employment, Health, Mental Health, Physical Health, Substance Abuse, Homeless Shelters, Family Shelters, Women’s Shelters, Youth Shelters, Housing, Maintenance, Rental Assistance, Utility Assistance" },
  { latitude: -27.472300, longitude: 153.023630, title: 'Centacare', description: "Childcare, Counseling, Education, Health, Mental Health, Physical Health, Homeless Shelters, Day Shelters, Transportation" },
  { latitude: -27.278550, longitude: 152.982310, title: 'Encircle', description: "Childcare, Counseling, Education, Housing, Legal Assistance" },
  // Add more points of interest as needed
];

/**
 * The map view page is the central hub of the application. This is where the user is taken when they launch the app
 * The page is responsible for displaying flood areas, risks, and different addresses that are saved in the database
 * Users can locate to different locations using pop ups
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const MapViewComponent: React.FC = () => {

  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [isFloodWarningsEnabled, setIsFloodWarningsEnabled] = useState(true);
  const [isRouteNotificationsEnabled, setIsRouteNotificationsEnabled] = useState(true);
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(true);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [floodData, setFloodData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [closestPoint, setClosestPoint] = useState<{ latitude: number; longitude: number; title: string } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ latitude: number, longitude: number, title: string, description?: string } | null>(null);
  const mapViewRef = useRef<MapView>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [showDistancePopup, setShowDistancePopup] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false); // Track if notification has been sent
  const [prediction, setPrediction] = useState<any[]>([]);
  const [cameraPosition, setCameraPosition] = useState<{ latitude: number, longitude: number } | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [isLegendVisible, setIsLegendVisible] = useState(true);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [legendPosition] = useState(new Animated.Value(0));
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [home, setHome] = useState<Address | null>(null);
  const [work, setWork] = useState<Address | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<{ latitude: number, longitude: number } | null>(null);
  const [bellButtonPosition] = useState(new Animated.Value(80));
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const route = useRoute<any>();

  // searched location 
  const [searchedLocation, setSearchedLocation] = useState<{
    latitude: number;
    longitude: number;
    title: string;
  } | null>(null);

  // navigation pages
  type RootStackParamList = {
    MapViewComponent: undefined;
    PageOne: undefined;
    Settings: undefined;
  };

  // address type
  type Address = {
    latitude: number;
    longitude: number;
    address: string;
  };
  
  // saved address type
  type SavedAddress = Address & {
    id: string;
    title: string;
  };

  // sets legend height depending on whether expanded or not
  const legendHeight = legendPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 300], 
  });

  // fetches the user preferences from the firebase
  useEffect(() => {
    const fetchUserPreferences = () => {
      const userId = auth.currentUser?.uid; // Get the current user's ID

      if (!userId) return; // Ensure userId is defined

      const preferencesRef = ref(database, `users/${userId}/preferences`);
      onValue(preferencesRef, (snapshot) => {
        if (snapshot.exists()) {
          const preferences = snapshot.val();
          setIsLocationEnabled(preferences.locationServices || false);
          setIsFloodWarningsEnabled(preferences.floodZoneWarnings || false);
          setIsRouteNotificationsEnabled(preferences.routes || false);
          setIsPushNotificationsEnabled(preferences.pushNotifications || false);
        } else {
          // Set all to true if no preferences folder exists
          setIsLocationEnabled(true);
          setIsFloodWarningsEnabled(true);
          setIsRouteNotificationsEnabled(true);
          setIsPushNotificationsEnabled(true);
        }
      });
    };

    fetchUserPreferences();
  }, []);


  // Animate the swipe down motion for descriptions of locations
  const [popupPosition] = useState(new Animated.Value(0));
  
  /**
   * Use ref and pan responder to change the height of the pop up
   */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: Animated.event(
        [null, { dy: popupPosition }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: async (_, gestureState) => {
        if (gestureState.dy > 10) {
          Animated.timing(popupPosition, {
            toValue: Dimensions.get('window').height,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            // When the popup is dismissed, clear the selected point and location
            setSelectedPoint(null);
            setSearchedLocation(null);
          });
        } else {
          Animated.spring(popupPosition, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }

        // Get the camera position and log it
        if (mapViewRef.current) {
          const camera = await mapViewRef.current.getCamera();
          console.log(`Camera position: Latitude ${camera.center.latitude}, Longitude ${camera.center.longitude}`);
        }
      },
    })
  ).current;

  /**
   * Animate legend pop up
   */
  const legendPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.spring(legendPosition, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < 0) {
          Animated.spring(legendPosition, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          Animated.spring(legendPosition, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < -50) {
          Animated.spring(legendPosition, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  /**
   * This function takes a selected point on the map and checks what it is, the pop up will be shown which displays its information
   * @param point - the latitude, longitude, title and possible description of the selected point for a pop up
   */
  const showPopup = (point: { latitude: number, longitude: number, title: string, description?: string }) => {
    setSelectedPoint(point);
    setShowDistancePopup(false);
    disableExpandedLegend();
    Animated.timing(popupPosition, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // When user clicks shelter on find a shelter page, navigate to it
  useEffect(() => {
    if (route.params?.selectedPoint) {
      const { selectedPoint } = route.params;
      // Show the popup
      showPopup(selectedPoint);
  
      // Animate the map to the selected point's location
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: selectedPoint.latitude,
            longitude: selectedPoint.longitude,
            latitudeDelta: 0.005, 
            longitudeDelta: 0.005,
          },
          1000 // Animation duration in milliseconds
        );
      }
    }
  }, [route.params?.selectedPoint]);

  /**
   * Fetch flood data dynamically based on the user's location or scroll position
   * @param region - longitude and latitude of the region
   */
  const fetchFloodData = async (region: { latitude: number, longitude: number }) => {
    const { latitude, longitude } = region;
    const whereClause = `within_distance(geo_point_2d, geom'POINT(${longitude} ${latitude})', 2km) AND shape_area > 100`;
    const API_URL = `https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/flood-awareness-flood-risk-overall/records?where=${encodeURIComponent(whereClause)}&limit=100`;

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      const prediction = await predictFlooding(rainData);
      setPrediction(prediction);

      if (data && data.results) {
        setFloodData(data.results);
      } else {
        console.error('Unexpected API response structure:', data);
      }
    } catch (error) {
      console.error('Failed to fetch flood data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function to calculate the distance between two coordinates
   * @param lat1 - latitude of point 1
   * @param lon1 - longitude of point 1
   * @param lat2 - latitude of point 2
   * @param lon2 - longitude of point 2
   * @returns {number} - the distance calculation based on the two points
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon1 - lon2) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  /**
   * Find the closest point to the user
   * @param userLocation - the user's location
   */
  const findClosestPoint = (userLocation: Location.LocationObject) => {
    const { latitude, longitude } = userLocation.coords;
    let closestPoint = shelters[0];
    let minDistance = calculateDistance(latitude, longitude, closestPoint.latitude, closestPoint.longitude);

    shelters.forEach(point => {
      const distance = calculateDistance(latitude, longitude, point.latitude, point.longitude);
      if (distance < minDistance) {
        closestPoint = point;
        minDistance = distance;
      }
    });
    
    setClosestPoint(closestPoint);
    mapViewRef.current?.animateToRegion({
      latitude: closestPoint.latitude,
      longitude: closestPoint.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000); // Duration of the animation in milliseconds
  };

  /**
   * This uses Google's API to compare the user's location with the selected point
   * @param origin - users longitude and latitude
   * @param destination - destination longitude and latitude
   */
  const fetchDistanceAndDuration = async (origin: { latitude: number, longitude: number }, destination: { latitude: number, longitude: number }) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const distance = data.routes[0].legs[0].distance.value / 1000; // Convert meters to kilometers
        const duration = data.routes[0].legs[0].duration.value / 60; // Convert seconds to minutes
        setDistance(distance);
        setDuration(duration);
        setShowDistancePopup(true);
        setSelectedPoint(null);
      } else {
        console.error('Error in Directions API response:', data.status);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  /**
   * Handles when the user locates to a different point of the map. It takes the camera position and updates the flood data.
   * @param region - the current region of the map page
   */
  const handleRegionChangeComplete = async (region: Region) => {
    const newCameraPosition = { latitude: region.latitude, longitude: region.longitude };

    // Calculate if the camera position has changed significantly before fetching new data
    const distanceMoved = calculateDistance(cameraPosition?.latitude || 0, cameraPosition?.longitude || 0, newCameraPosition.latitude, newCameraPosition.longitude);

    if (distanceMoved > 1) { // Fetch new data if the user moves more than 1km
      setCameraPosition(newCameraPosition);
      await fetchFloodData(newCameraPosition);
    }
  };
  
  // gets the current user
  useEffect(() => {
    const fetchUserEmail = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser.email);
      }
    };

    fetchUserEmail(); // Fetch the user's email when the component mounts
  }, []);

  // Gets user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc); // Set user location
        fetchFloodData(loc.coords); // Fetch flood zones initially
        findClosestPoint(loc); // Find and navigate to the closest point
      } else {
        console.log('Permission not granted');
        setLoading(false);
      }
    })();
  }, []);

  // legend expansion
  useEffect(() => {
    const listenerId = legendPosition.addListener(({ value }) => {
      setLegendExpanded(value === 1);
    });
  
    return () => {
      legendPosition.removeListener(listenerId);
    };
  }, [legendPosition]);

  /**
   * Handle when user presses start on the shelter pop up
   */
  const handleStartButtonPress = () => {
    if (selectedPoint && location) {
      const { latitude, longitude } = location.coords;
      const { latitude: destLat, longitude: destLng } = selectedPoint;

      setActiveRoute({ latitude: destLat, longitude: destLng });
      fetchDistanceAndDuration({ latitude, longitude }, { latitude: destLat, longitude: destLng });
    }
  };

  // This takes the data from the database and sets the home/work address as well as saved addresses
  useEffect(() => {
    const user = auth.currentUser; // Get the current user

    if (!user) return; // Ensure user is defined

    const userRef = ref(database, `users/${user.uid}`); // Adjusted path for the user's data

    // Fetch user data
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Set home
        if (data.home) {
          setHome({
            address: data.home.address,
            latitude: data.home.latitude,
            longitude: data.home.longitude,
          });
        }

        // Set work
        if (data.work) {
          setWork({
            address: data.work.address,
            latitude: data.work.latitude,
            longitude: data.work.longitude,
          });
        }

        // Set saved addresses
        const addresses: SavedAddress[] = [];
        const savedAddressesData = data.savedAddresses || {};
        for (const id in savedAddressesData) {
          if (savedAddressesData.hasOwnProperty(id)) {
            addresses.push({
              id, // Include the id here
              title: savedAddressesData[id].title,
              address: savedAddressesData[id].address,
              latitude: savedAddressesData[id].latitude,
              longitude: savedAddressesData[id].longitude,
            });
          }
        }
        setSavedAddresses(addresses);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [auth.currentUser]);

  /**
   * Disable expanded legend
   */
  const disableExpandedLegend = () => {
    if (legendExpanded) {
      Animated.spring(legendPosition, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  };
  
  /**
   * Handle when user presses "alert" button on legend
   */
  const handleAlertButtonPress = () => {
    navigation.navigate('PageOne');
    disableExpandedLegend();
  };

  /**
   * Handle when user presses exit on the distance pop up
   */
  const handleExitButtonPress = () => {
    setShowDistancePopup(false);
    setActiveRoute(null);
    
  };
  
  /**
   * Get the flood zone colour to be displayed the map
   * @param risk - the risk level
   * @returns {string} - the colour codes for the associated risk
   */
  const getFloodColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return { strokeColor: '#FF0000', fillColor: 'rgba(255, 0, 0, 0.3)' }; // Red for high risk
      case 'Medium':
        return { strokeColor: '#FFA500', fillColor: 'rgba(255, 165, 0, 0.3)' }; // Orange for medium risk
      case 'Low':
        return { strokeColor: '#FFFF00', fillColor: 'rgba(255, 255, 0, 0.3)' }; // Yellow for low risk
      default:
        return { strokeColor: '#00FF00', fillColor: 'rgba(0, 255, 0, 0.3)' }; // Green for unknown or no risk
    }
  };

  /**
   * Fetch address suggestions based on query
   * @param text the entered address text in the search bar
   */
  const handleQueryChange = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) { // Trigger suggestions after typing more than 2 characters
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_APIKEY}`
        );
        setSuggestions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        Alert.alert('Error', 'Failed to fetch address suggestions');
      }
    } else {
      setSuggestions([]);
    }
  };

  /**
   * Handle when a suggestion is selected. Uses Google Maps API to get the latitude and longitude of the searched address
   * @param placeId the id of the address
   */
  const handleSelectAddress = async (placeId: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const location = response.data.result.geometry.location;
      const address = response.data.result.formatted_address;
      setSearchQuery(response.data.result.formatted_address); // Set the query to the selected address
      setSuggestions([]);

      // Set the selected location for dropping a pin
      setSearchedLocation({
        latitude: location.lat,
        longitude: location.lng,
        title: address,
      });
      
      // Navigate to the selected address on the map
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000
        );
      }

      // Show popup with the selected address
      showPopup({
        latitude: location.lat,
        longitude: location.lng,
        title: response.data.result.formatted_address,
        description: response.data.result.formatted_address,
      });
    } catch (error) {
      console.error('Error fetching address details:', error);
      Alert.alert('Error', 'Failed to retrieve address details');
    }
  };

  /**
   * Handle when user searches from search bar
   * @param query sets the search query based off what the user clicks on
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    handleQueryChange(query); // Fetch suggestions based on the search query
  };

  /**
   * Handle when Home button is pressed. When this is done a pop up is shown which gives 
   * the user information and a way to navigate to it.
   */
  const handleHomePress = () => {
    if (home) {
      // Center the map on Home's location
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: home.latitude,
            longitude: home.longitude,
            latitudeDelta: 0.005, 
            longitudeDelta: 0.005, 
          },
          1000 // Animation duration in milliseconds
        );

        // Show the popup for Home
        showPopup({
          latitude: home.latitude,
          longitude: home.longitude,
          title: "Home",
          description: home.address || "Home Address Not Available",
        });
      } else {
        console.log("Home address is not available.");
      }
    }
  };

  /**
   * Handle when Work button is pressed. When this is done a pop up is shown which gives 
   * the user information and a way to navigate to it.
   */
  const handleWorkPress = () => {
    if (work) {
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: work.latitude,
            longitude: work.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000
        );

        // Show the popup for Work
        showPopup({
          latitude: work.latitude,
          longitude: work.longitude,
          title: "Work",
          description: work.address || "Work Address Not Available",
        });
      } else {
        console.log("Work address is not available.");
      }
    }
  };
  
  /**
   * Handle saved addresses button(s). A pop up is shown when this occurs.
   * @param address the saved address that is being accessed
   */
  const handleSavedAddressPress = (address: SavedAddress) => {
    if (mapViewRef.current) {
      mapViewRef.current.animateToRegion(
        {
          latitude: address.latitude,
          longitude: address.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );

      // Show popup for saved addresses
      showPopup({
        latitude: address.latitude,
        longitude: address.longitude,
        title: address.title,
        description: address.address,
      });
    }
  };

  /**
   * Handle when the alert bell is clicked
   */
  const handleBellPress = async () => {
    await fetchNotifications(); // Fetch notifications on bell press
    setNotificationsVisible(true); // Show the popup
  };

  /**
   * Handle when the notifications are closed
   */
  const handleCloseNotifications = () => {
    setNotificationsVisible(false);
  };

  // Check whether the legend needs to be expanded or not
  useEffect(() => {
    const toValue = legendExpanded ? 320 : 80; // Move up when expanded, otherwise stay at 80
    Animated.spring(bellButtonPosition, {
      toValue,
      useNativeDriver: false,
    }).start();
  }, [legendExpanded]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  /**
   * This function checks the current user and fetches their current notifications from the notification component.
   * @returns {User} - the current user
   */
  const fetchNotifications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const notificationsRef = ref(database, `users/${user.uid}/notifications`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const fetchedNotifications = snapshot.val();
        const notificationsArray = Object.values(fetchedNotifications); // Convert object to array
        setNotifications(notificationsArray); // Set the notifications in state
      } else {
        console.log("No notifications found");
        setNotifications([]); // Clear notifications if none are found
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  

  return (
    <View style={styles.container}>

      <View style={styles.buttonsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.scrollButtonsContainer}
        >
          <TouchableOpacity style={styles.button} onPress={handleHomePress}>
            <Ionicons name="home-outline" size={24} color="black" />
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleWorkPress}>
            <Ionicons name="briefcase-outline" size={24} color="black" />
            <Text style={styles.buttonText}>Work</Text>
          </TouchableOpacity>

          {savedAddresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={styles.button}
              onPress={() => handleSavedAddressPress(address)}
            >
              <Ionicons name="location-outline" size={24} color="black" />
              <Text style={styles.buttonText}>{address.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      
      <View style={styles.searchMenuContainer}>
        <View style={styles.searchBarContainer}>
          {/* Navigation Component inside the Search Bar */}
          <View style={styles.navigationBar}>
            <Navigation userName={user}/>
          </View>

          {/* Vertical line */}
          <View style={styles.verticalLine} />

          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor={"black"}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          <TouchableOpacity onPress={() => handleQueryChange(searchQuery)} style={styles.searchIcon}>
            <Ionicons name="search-outline" size={34} color="black" />
          </TouchableOpacity>
        </View>
    
      {/* Display suggestions if available */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectAddress(item.place_id)}>
                <Text style={styles.suggestion}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
    )}
    </View>
      
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords?.latitude || -27.4698,
          longitude: location?.coords?.longitude || 153.0251,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {isLocationEnabled && location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={"Your Location"}
          />
        )}
  
        {shelters.map((point, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.title}
            onPress={() => showPopup({ 
              latitude: point.latitude, 
              longitude: point.longitude, 
              title: point.title, 
              description: point.description 
            })}
          >
            <Image 
                source={require("../assets/shelter.png")}  
                style={{ width: 40, height: 40, resizeMode: 'contain' }} 
            />
          </Marker>
        ))}

        {/* Render home address marker if available */}
      {home && (
        <Marker 
          coordinate={{ latitude: home.latitude, longitude: home.longitude }} 
          title='Home'
          onPress={() => showPopup({ 
            latitude: home.latitude, 
            longitude: home.longitude, 
            title: "Home", 
            description: home.address || "Home Address Not Available"
          })}>
          <Image 
            source={require("../assets/home.png")} 
            style={{ width: 40, height: 40, resizeMode: 'contain' }} 
          />
        </Marker>
      )}

      {/* Render work address marker if available */}
      {work && (
        <Marker 
          coordinate={{ latitude: work.latitude, longitude: work.longitude }} 
          title='Work'
          onPress={() => showPopup({ 
            latitude: work.latitude, 
            longitude: work.longitude, 
            title: "Work", 
            description: work.address || "Work Address Not Available" // Provide a fallback
          })}
          >
          <Image 
            source={require("../assets/work.png")}  
            style={{ width: 40, height: 40, resizeMode: 'contain' }} 
          />
        </Marker>
      )}

      {/* Render saved addresses markers */}
      {savedAddresses.map((savedAddress) => (
        <Marker
          key={savedAddress.id}
          coordinate={{ latitude: savedAddress.latitude, longitude: savedAddress.longitude }}
          title={savedAddress.title}
          onPress={() => showPopup({ 
            latitude: savedAddress.latitude, 
            longitude: savedAddress.longitude, 
            title: savedAddress.title, 
            description: savedAddress.address || "Saved Address Not Available" // Provide a fallback
          })}
          
        >
          <FontAwesome5 name='map-marker-alt' size={32} color="#35D346" />
        </Marker>
      ))}

      {searchedLocation && (
          <Marker
            coordinate={{
              latitude: searchedLocation.latitude,
              longitude: searchedLocation.longitude,
            }}
            title={'Searched Location'}
            
          >
            <Image 
                  source={require("../assets/Location.png")}  
                  style={{ width: 40, height: 40, resizeMode: 'contain' }} 
            />
          </Marker>
        )}

  
        {isRouteNotificationsEnabled && isLocationEnabled && location && (
          <MapViewDirections
            origin={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            destination={activeRoute || closestPoint || { latitude: location.coords.latitude, longitude: location.coords.longitude }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={6}
            strokeColor="#35D346"
            onReady={result => {
              setDistance(result.distance);
              setDuration(result.duration);
            }}
            onError={(errorMessage) => {
              console.error('Error in MapViewDirections:', errorMessage);
            }}
          />
        )}

        
        {isFloodWarningsEnabled && floodData.map((flood, index) => {
          const geoShape = flood.geo_shape?.geometry;
          const floodRisk = flood.flood_risk;
          const { strokeColor, fillColor } = getFloodColor(floodRisk);

          if (geoShape && geoShape.coordinates) {
            try {
              const polygons = geoShape.type === 'MultiPolygon' ? geoShape.coordinates : [geoShape.coordinates];
              return polygons.map((polygon: any, polygonIndex: number) => (
                polygon.map((ring: any, ringIndex: number) => {
                  const coordinates = ring.map((coord: [number, number]) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                  }));
                  return (
                    <Polygon
                      key={`${index}-${polygonIndex}-${ringIndex}`}
                      coordinates={coordinates}
                      strokeColor={strokeColor}
                      fillColor={fillColor}
                      strokeWidth={1}
                    />
                  );
                })
              ));
            } catch (error) {
              console.error(`Error rendering polygon at index ${index}:`, error);
              return null;
            }
          }
          return null;
        })}
      </MapView>
  
      {isFloodWarningsEnabled && isPushNotificationsEnabled && (
        <NotificationComponent
          floodData={prediction}
          notificationSent={notificationSent}
          setNotificationSent={setNotificationSent}
        />
      )}
  
      {selectedPoint && (
        <Animated.View {...panResponder.panHandlers} style={[styles.popup, { transform: [{ translateY: popupPosition }] }]}>
          <View style={styles.swipeBar} />
          <Text style={styles.popupTitle}>{selectedPoint.title}</Text>
          <Text style={styles.popupDescription}>
            <Text style={{ fontWeight: 'bold' }}>Latitude: </Text>{selectedPoint.latitude}
          </Text>
          <Text style={styles.popupDescription}>
            <Text style={{ fontWeight: 'bold' }}>Longitude: </Text>{selectedPoint.longitude}
          </Text>
          <Text style={styles.popupDescription}>
            <Text style={{ fontWeight: 'bold' }}>Details: </Text>{selectedPoint.description}
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartButtonPress}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bell Icon Button */}
      <Animated.View style={[styles.bellButton, { bottom: bellButtonPosition }]}>
        <TouchableOpacity onPress={handleBellPress}>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Notifications Popup */}
      <NotificationsPopup
        visible={notificationsVisible} // Show or hide based on state
        notifications={notifications} // Pass fetched notifications here
        onClose={handleCloseNotifications} // Handle closing the popup
      />
  
      {isLegendVisible && (
        <Animated.View
          {...legendPanResponder.panHandlers}
          style={[
            styles.legendPopup,
            { height: legendHeight },
          ]}
        >
          <View style={styles.swipeBar} />
          <Text style={styles.legendTitle}>Legend:</Text>
  
          {legendExpanded && (
            <View style={styles.legendDetails}>
              <View style={styles.legendRow}>
                <View style={styles.leftContent}>
                  <View style={styles.redRectangle} />
                  <Text style={styles.legendText}>Extreme Risk</Text>
                </View>
                <View style={styles.iconContainer}>
                  <Image 
                    source={require("../assets/home.png")}  
                    style={{ width: 40, height: 40, resizeMode: 'contain' }} 
                  />
                  <Text style={styles.legendText}>Home</Text>
                </View>
              </View>
  
              <View style={styles.legendRow}>
                <View style={styles.leftContent}>
                  <View style={styles.orangeRectangle} />
                  <Text style={styles.legendText}>High Risk</Text>
                </View>
                <View style={styles.iconContainer}>
                  <Image 
                    source={require("../assets/work.png")}  
                    style={{ width: 40, height: 40, resizeMode: 'contain' }} 
                  />
                  <Text style={styles.legendText}>Work</Text>
                </View>
              </View>
  
              <View style={styles.legendRow}>
                <View style={styles.leftContent}>
                  <View style={styles.yellowRectangle} />
                  <Text style={styles.legendText}>Medium Risk</Text>
                </View>
                <View style={styles.iconContainer}>
                  <Image 
                    source={require("../assets/shelter.png")}  
                    style={{ width: 40, height: 40, resizeMode: 'contain' }} 
                  />
                  <Text style={styles.legendText}>Shelter</Text>
                </View>
              </View>

              <View style={styles.legendRow}>
                <View style={styles.leftContent}>
                  <View style={styles.greenRectangle} />
                  <Text style={styles.legendText}>Low Risk</Text>
                </View>
        
              </View>
  

            </View>
          )}
        </Animated.View>
      )}
  
      {showDistancePopup && (
        <View style={styles.distancePopup}>
          <View style={styles.leftSide}>
            {isLocationEnabled ? (
              <>
                <Text style={styles.durationText}>{duration?.toFixed(0)} Minutes</Text>
                <Text style={styles.distanceText}>{distance?.toFixed(1)} km</Text>
              </>
            ) : (
              <Text style={styles.noLocationText}>No User Location Provided</Text>
            )}
          </View>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitButtonPress}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 30,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    zIndex: 10
  },
  popupTitle: {
    fontSize: 24,
    paddingBottom: 20,
  },
  popupDescription: {
    marginTop: 5,
    fontSize: 16,
  },
  startButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#35D346',
    borderRadius: 5,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  swipeBar: {
    width: 80,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  distancePopup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSide: {
    flex: 1,
    paddingRight: 10,
  },
  durationText: {
    fontSize: 28,
    marginVertical: 5,
  },
  distanceText: {
    fontSize: 20,
    marginVertical: 5,
    color: '#808080',
  },
  exitButton: {
    backgroundColor: '#35D346',
    paddingVertical: 15,
    paddingHorizontal: 35,
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  noLocationText: {
    fontSize: 20,
  },

  legendPopup: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 10,
  },
  
  legendTitle: {
    textAlign: 'center',
    fontSize: 24,
    paddingBottom: 20
  },
  legendDetails: {
    paddingHorizontal: 20,
  },
  legendText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 10,
  },

  legendRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  redRectangle: {
    width: 60,
    height: 30,
    backgroundColor: 'red',
  },
  orangeRectangle: {
    width: 60,
    height: 30,
    backgroundColor: 'orange',
  },

  yellowRectangle: {
    width: 60,
    height: 30,
    backgroundColor: 'yellow'
  },

  greenRectangle: {
    width: 60,
    height: 30,
    backgroundColor: 'lime',
  },

  iconContainer: {
    flexDirection: 'row',
    width: '35%',
  },

  leftContent: {
    flexDirection: 'row',
    flex: 1,
  },

  
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: 70,
  },

  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    height: '100%', // Ensures the TextInput takes full height
    paddingHorizontal: 10, // Padding inside the TextInput
  },

  searchMenuContainer: {
    top: 30, 
    flexDirection: 'column', // Keep it column to manage absolute positioning
    alignItems: 'center',
    zIndex: 1,
    position: 'absolute',
    paddingHorizontal: 10,
    width: '100%', // Ensure it takes full width
  },

  buttonsContainer: {
    position: 'absolute',
    top: 110,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 1,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  buttonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },

  scrollButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  suggestion: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    fontSize: 16,

  },

  suggestionContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    zIndex: 10,
  },

  navigationBar: {
    zIndex: 10, 
  },

  bellButton: {
    position: 'absolute',
    bottom: 80, // Position it just above the legend
    right: 20, // Right alignment
    backgroundColor: '#FF4500', // Customize background color
    borderRadius: 35, // Make it round
    padding: 20, // Add padding for better touchability
    elevation: 3, // Shadow on Android
    shadowColor: '#000', // Shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  verticalLine: {
    width: 2, 
    height: '100%', 
    backgroundColor: 'black',
    marginHorizontal: 5
  },

});

export default MapViewComponent;