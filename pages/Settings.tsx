import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity, 
  Alert
 } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../app/index';  // Import RootStackParamList
import { signOut } from 'firebase/auth';
import { ref, onValue, remove, get, set } from 'firebase/database';
import { auth, database } from '../firebaseConfig'; // Import Firebase configuration

/**
 * The settings page is responsible for allowing the user to set/change addresses, as well as toggle different preferences
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const Settings: React.FC = () => {
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use typed navigation
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [homeAddress, setHomeAddress] = useState<HomeWorkAddress | null>(null);
  const [workAddress, setWorkAddress] = useState<HomeWorkAddress | null>(null);

  const [isLocationEnabled, setLocationEnabled] = useState(true);
  const [isFloodWarningsEnabled, setFloodWarningsEnabled] = useState(true);
  const [isRouteNotificationsEnabled, setRouteNotificationsEnabled] = useState(true);
  const [isPushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);

  type Address = {
    id: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
  };

  type HomeWorkAddress = {
    address: string;
    latitude: number;
    longitude: number;
  }

  /**
   * Handle user going map to map page
   */
  const handleBack = () => {
    navigation.navigate('MapViewComponent');
  };

  /**
   * Handle deleting saved address from user account
   * @param id - unique id of the saved address to be deleted
   */
  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              const addressRef = ref(database, `users/${userId}/savedAddresses/${id}`);
              await remove(addressRef); // Remove the address from Firebase
            } catch (error) {
              Alert.alert('Error', 'Failed to delete the address');
            }
          },
        },
      ]
    );
  };

  /**
   * Handles when navigating to the add address page, it gets the type of add that is being utilised
   * @param type - the type of address be added/edited (i.e. home/work or saved)
   */
  const handleAddAddress = (type: 'home' | 'work' | null = null) => {
    navigation.navigate('AddSavedAddress', { type });  // Pass 'null' for regular addresses
  };

  /**
   * Handles when the user logs out through the settings
   */
  const handleLogOut = () => {
    signOut(auth)
    .then(() => {
      console.log('User logged out');
      navigation.navigate('LoginPage');  // Navigate to login page
    })
    .catch((error) => {
      console.error('Error logging out:', error);
    });
  }

  // Fetch saved addresses from Firebase
  useEffect(() => {
    const userId = auth.currentUser?.uid; // Get current user's ID
    const addressesRef = ref(database, `users/${userId}/savedAddresses`);
    
    const unsubscribe = onValue(addressesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedAddresses: Address[] = Object.keys(data).map((key) => ({
          id: key,
          title: data[key].title,
          address: data[key].address,
          latitude: data[key].latitude,
          longitude: data[key].longitude,
        }));
        setAddresses(fetchedAddresses);
      } else {
        setAddresses([]);
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  useEffect(() => {
    const userId = auth.currentUser?.uid;  // Ensure userId is defined
    if (!userId) return; // Exit if no user is logged in
  
    const homeRef = ref(database, `users/${userId}/home`);
    const workRef = ref(database, `users/${userId}/work`);
  
    // Listen for changes to home address
    onValue(homeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHomeAddress({ address: data.address, latitude: data.latitude, longitude: data.longitude });
      } else {
        setHomeAddress(null);
      }
    });
  
    // Listen for changes to work address
    onValue(workRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWorkAddress({ address: data.address, latitude: data.latitude, longitude: data.longitude });
      } else {
        setWorkAddress(null);
      }
    });
  }, []);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      try {
        const userSettingsRef = ref(database, `users/${userId}/preferences`);
        const snapshot = await get(userSettingsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setLocationEnabled(data.locationServices ?? true);
          setFloodWarningsEnabled(data.floodZoneWarnings ?? true);
          setRouteNotificationsEnabled(data.routes ?? true);
          setPushNotificationsEnabled(data.pushNotifications ?? true);
        } else {
          // Initialise default settings if none exist
          await set(userSettingsRef, {
            locationServices: true,
            floodZoneWarnings: true,
            routes: true,
            pushNotifications: true,
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Error');
      }
    };

    fetchUserSettings();
  }, []);

  /**
   * Update the specific preference when the user toggles it on or off
   * @param key the toggle being changed (i.e. location services)
   * @param value boolean value that is being changed
   * @returns 
   */
  const updateSetting = async (key: string, value: boolean) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      const userSettingsRef = ref(database, `users/${userId}/preferences/${key}`);
      await set(userSettingsRef, value);
    } catch (error) {
      Alert.alert('Error', 'Error');
    }
  };


  return (
    <View style={styles.background}>
      <ScrollView style={styles.container}>

      <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back-outline" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
        
      {/* Home Address */}
      <Text style={styles.heading}>Home Address</Text>
      {homeAddress ? (
        <View style={styles.homeWorkContainer}>
          <Text style={styles.descriptionText}>{homeAddress.address}</Text>
          <TouchableOpacity onPress={() => handleAddAddress('home')}>
            <Ionicons name="create-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => handleAddAddress('home')} style={styles.button}>
          <Ionicons name="add-outline" size={28} color="black" />
          <Text style={styles.descriptionText}>Add Home Address</Text>
        </TouchableOpacity>
      )}

      {/* Work Address */}
      <Text style={styles.heading}>Work Address</Text>
      {workAddress ? (
        <View style={styles.homeWorkContainer}>
          <Text style={styles.descriptionText}>{workAddress.address}</Text>
          <TouchableOpacity onPress={() => handleAddAddress('work')}>
            <Ionicons name="create-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => handleAddAddress('work')} style={styles.button}>
          <Ionicons name="add-outline" size={28} color="black" />
          <Text style={styles.descriptionText}>Add Work Address</Text>
        </TouchableOpacity>
      )}

        {/* Saved Addresses */}
        <Text style={styles.heading}>Saved Addresses</Text>
        <>
        {addresses.map((item) => (
          <View key={item.id} style={styles.addressesContainer}>
            <Text style={styles.descriptionText}>{item.title}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="close-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>
        ))}
        </>

        <TouchableOpacity onPress={() => handleAddAddress(null)} style={styles.button}>
          <Ionicons name="add-outline" size={28} color="black" />
          <Text style={styles.descriptionText}>Add Address</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Map Settings</Text>


        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Ionicons name="location-outline" size={24} />
            <Text style={styles.settingText}>Location Services</Text>
          </View>
          <Switch
            value={isLocationEnabled}
            onValueChange={(value) => {
              setLocationEnabled(value);
              updateSetting('locationServices', value);
            }}
            thumbColor={isLocationEnabled ? 'black' : 'black'}
            trackColor={{ false: 'grey', true: '#808080' }}
            style={styles.switch}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Ionicons name="warning-outline" size={24} />
            <Text style={styles.settingText}>Flood Zone Warnings</Text>
          </View>
          <Switch
            value={isFloodWarningsEnabled}
            onValueChange={(value) => {
              setFloodWarningsEnabled(value);
              updateSetting('floodZoneWarnings', value);
            }}
            thumbColor={isLocationEnabled ? 'black' : 'black'}
            trackColor={{ false: 'grey', true: '#808080' }}
            style={styles.switch}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
          <FontAwesome5 name="route" size={24} />
            <Text style={styles.settingText}>Routes</Text>
          </View>
          <Switch
            value={isRouteNotificationsEnabled}
            onValueChange={(value) => {
              setRouteNotificationsEnabled(value);
              updateSetting('routes', value);
            }}
            thumbColor={isLocationEnabled ? 'black' : 'black'}
            trackColor={{ false: 'grey', true: '#808080' }}
            style={styles.switch}
          />
        </TouchableOpacity>

        <Text style={styles.heading}>Notifications</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Ionicons name="notifications-outline" size={24} />
            <Text style={styles.settingText}>Push Notifications</Text>
          </View>
          <Switch
            value={isPushNotificationsEnabled}
            onValueChange={(value) => {
              setPushNotificationsEnabled(value);
              updateSetting('pushNotifications', value);
            }}
            thumbColor={isLocationEnabled ? 'black' : 'black'}
            trackColor={{ false: 'grey', true: '#808080' }}
            style={styles.switch}
          />
        </TouchableOpacity>


        <Text style={styles.heading}>Account</Text>
          
          <TouchableOpacity style={styles.addressesContainer} onPress={handleLogOut}>
            <Text style={[styles.descriptionText, styles.descriptionText]}>Log Out</Text>
            <Ionicons name="chevron-forward-outline" size={28} color="black"></Ionicons>
          </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 30,
  },

  backButton: {
    position: 'absolute', 
    left: 0,               
    paddingLeft: 10,
  },

  title: {
    fontSize: 32,

  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginHorizontal: 20,
  },

  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },

  heading: {
    paddingVertical: 8,
    paddingLeft: 8,
    backgroundColor: '#D3D3D3',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18
  },

  descriptionText: {
    fontSize: 18,
    paddingVertical: 10
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    marginBottom: 5,
  },

  addressesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    marginHorizontal: 20,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  homeWorkContainer: {
    marginHorizontal: 20,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }

});

export default Settings;