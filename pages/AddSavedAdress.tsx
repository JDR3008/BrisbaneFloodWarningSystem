import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList } from '../app/index'; // Import RootStackParamList
import { auth, database } from '../firebaseConfig';  // Import Firebase auth and database
import { ref, push, set } from 'firebase/database'; 

type AddSavedAddressParams = {
  type: 'home' | 'work' | null;  // Type can be home, work, or null for regular addresses
};

/**
 * This page is responsible for the user being able to add a saved address / edit their home and work addresses
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const AddSavedAddress: React.FC = () => {
  const GOOGLE_MAPS_APIKEY = 'AIzaSyB5QACGchCem1oFqlkmx0fmXkHHUulxQUk'; 
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use typed navigation
  const [title, setTitle] = useState('');
  const route = useRoute<RouteProp<{ params: AddSavedAddressParams }>>();
  const { type } = route.params;  // Get the type from route parameters
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Handle when the user clicks back
   */
  const handleBack = () => {
    navigation.navigate('Settings');
  };

  /**
   * This function handles when the user is typing in the address field, it ensures that after a certain number of characters
   * that addresses will pop up based on the search
   * @param text - the text that the user has inputted into the address field
   */
  const handleQueryChange = async (text: string) => {
    setQuery(text);
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
   * This function utilises Google Maps API to get the latitude and longitude of the entered address
   * @param placeId - the id of the searched location
   */
  const handleSelectAddress = async (placeId: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const location = response.data.result.geometry.location;
      setLatitude(location.lat);
      setLongitude(location.lng);
      setSelectedAddress(response.data.result.formatted_address);
      setQuery(response.data.result.formatted_address); // Set the query to the selected address
      setSuggestions([]);
      setIsSubmitted(false);
    } catch (error) {
      console.error('Error fetching address details:', error);
      Alert.alert('Error', 'Failed to retrieve address details');
    }
  };

  /**
   * This function handles when the user clicks submit after entering an address
   * @returns {Alert} - returns an alert of success of failure
   */
  const handleSubmit = async () => {
    const user = auth.currentUser;  // Get the current user
    if (!user) {
        Alert.alert('Error', 'You must be signed in to save an address');
        return;
    }

    if (!selectedAddress || latitude === null || longitude === null) {
        Alert.alert('Error', 'Please provide all required details');
        return;
    }

    try {
        let addressRef;

        if (type === 'home' || type === 'work') {
            // Save the address under the current user's home or work section in Firebase
            addressRef = ref(database, `users/${user.uid}/${type}`);
            await set(addressRef, {  // Directly set the details under 'home' or 'work'
                address: selectedAddress,
                latitude,
                longitude,
            });
        } else {
            // For saved addresses, use push to create a unique ID for each address
            addressRef = ref(database, `users/${user.uid}/savedAddresses`);
            await push(addressRef, {
                title,
                address: selectedAddress,
                latitude,
                longitude,
            });
        }

        Alert.alert('Success', 'Address saved successfully!');
        navigation.navigate('Settings');  // Navigate back to settings after saving
    } catch (error) {
        console.error('Error saving address:', error);
        Alert.alert('Error', 'Failed to save the address');
    }
};

  return (
    <View style={[styles.container, styles.background]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back-outline" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {type === 'home' ? 'Edit Home Address' : type === 'work' ? 'Edit Work Address' : 'Add Address'}
        </Text>
      </View>

      {/* Title Input */}
      <Text style={styles.descriptionText}>Name</Text>
      {type ? (
        <TextInput
        style={[
          styles.input,
          (type === 'home' || type === 'work') && styles.greyedOutInput,
        ]}
        placeholder={type === 'home' ? 'Home' : 'Work'} // Placeholder based on type
        value={type === 'home' ? 'Home' : 'Work'} // Display as non-editable text
        editable={false} // Make it non-editable
      />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="#000"
          value={title}
          onChangeText={setTitle}
        />
      )}

      <Text style={styles.descriptionText}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        placeholderTextColor="#000"
        value={query}
        onChangeText={handleQueryChange}
      />

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectAddress(item.place_id)}>
              <Text style={styles.suggestion}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text>Add</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
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
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  result: {
    marginTop: 16,
  },
  descriptionText: {
    fontSize: 18,
    paddingVertical: 10
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    alignItems: 'center',
  },

  greyedOutInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0', // Light grey background
    color: '#888888', // Grey text color
  },
});

export default AddSavedAddress;