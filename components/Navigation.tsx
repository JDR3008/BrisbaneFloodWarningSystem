import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, Animated, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../app/index';
import { signOut } from 'firebase/auth';


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

interface NavigationProps {
  userName: string;
}

/**
 * This component is the navigation bar that is displayed on the map page of the application
 * @param userName - gets the current user so it can be displayed on at the bottom of the navigation component
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const Navigation: React.FC<NavigationProps> = ({ userName }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const animatedWidth = useState(new Animated.Value(0))[0];
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  /**
   * Handles when the user clicks the menu button, opens up the navigation bar
   */
  const handleMenuPress = () => {
    setMenuOpen(!menuOpen);
    Animated.timing(animatedWidth, {
      toValue: menuOpen ? 0 : screenWidth * 0.75, // Expand to 75% width or collapse
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Handles when the user closes the navigation bar, closes the navigation bar.
   */
  const handleClosePress = () => {
    setMenuOpen(false);
    Animated.timing(animatedWidth, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Handles when the user clicks the sign out button
   */
  const handleLoginPress = () => {
    // Implement your navigation logic to Log-In/Sign-Up page here
    console.log('Navigating to Log-In/Sign-Up page');
    navigation.navigate('LoginPage');
  };

  /**
   * Handles when the user clicks flood preparation
   */
  const handleFloodPress = () => {
    console.log('Navigating to Flood Preparation Page');
    navigation.navigate('FloodPreparation');
  };

  /**
   * Handles when the user clicks find a shelter
   */
  const handleShelterPress = () => {
    navigation.navigate('FindAShelter');
  };

  /**
   * Handles when the user clicks settings
   */
  const handleSettingsPress = () => {
    console.log('Navigating to Settings Page');
    navigation.navigate('Settings');
  };

  /**
   * Handles when the user clicks info page
   */
  const handleInfoPress = () => {
    console.log('Navigating to Info Page');
    navigation.navigate('InfoPage');
  } 

  /**
   * Handles when the user clicks help centre
   */
  const handleHelpPress = () => {
    navigation.navigate('Help');
  };

  const handleInFloodPreparation = () => {
    console.log('Navigating to InFlood Preparation Page');
    navigation.navigate('InFloodPreparation')
  }

  /**
   * Handles when the user clicks necessities page
   */
  const handleNecessitiesPress = () => {
    navigation.navigate('Necessities');
  }

  /**
   * Handles when the user clicks the sign out button
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Close the menu when navigating back to this page
      handleClosePress();
    });

    return unsubscribe; // Clean up the listener
  }, [navigation]);

  /**
   * Gets the user name and shortens it if it is too long
   * @param name - the name of the user
   * @returns {string} - the shortened name
   */
  const getUserName = (name: string) => {
    return name.length > 10 ? name.substring(0, 10) + '...' : name;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleMenuPress}>
        <View style={styles.iconBackground}>
          <Ionicons name="menu-outline" size={34} color="black" />
        </View>
      </TouchableOpacity>

      {/* Absolute Positioned Menu */}
      {menuOpen && (
        <Animated.View style={[styles.menu, { width: animatedWidth }]}>

          
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClosePress}>
            <Ionicons name="close-outline" size={34} color="black" />
          </TouchableOpacity>

          <View style={styles.test}>

          <Text style={styles.sectionHeader}>Pre-flood</Text>
          {/* Login Button */}
          <TouchableOpacity style={styles.menuButton} onPress={handleNecessitiesPress}>
            <Text style={styles.menuButtonText}>Necessities</Text>
          </TouchableOpacity>

          {/* Flood Preparation Button */}
          <TouchableOpacity style={styles.menuButton} onPress={handleFloodPress}>
            <Text style={styles.menuButtonText}>Flood Preparation</Text>
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>In-flood</Text>
          {/* Find A Shelter Button */}
          <TouchableOpacity style={styles.menuButton} onPress={handleShelterPress}>
            <Text style={styles.menuButtonText}>Find A Shelter</Text>
          </TouchableOpacity>

          {/* To-do List Button */}
          <TouchableOpacity style={styles.menuButton} onPress={handleInFloodPreparation}>
            <Text style={styles.menuButtonText}>To-do List</Text>
          </TouchableOpacity>


          {/* Help Button */}
          <TouchableOpacity style={styles.menuButton} onPress={handleHelpPress}>
            <Text style={styles.menuButtonText}>Help Centre</Text>
          </TouchableOpacity>
          
          <Text style={styles.sectionHeader}>Info Pages</Text>
          {/* Settings Button */}
          <TouchableOpacity style={styles.menuButton} onPress={handleSettingsPress}>
            <Text style={styles.menuButtonText}>Settings</Text>
          </TouchableOpacity>
          </View>

          {/* Info Page */}
          <TouchableOpacity style={styles.menuButton} onPress={handleInfoPress}>
            <Text style={styles.menuButtonText}>Info Page</Text>
          </TouchableOpacity>

          <View style={styles.loggedInSection}>
            <Text style={styles.loggedInText}>Logged-in as</Text>
            <View style={styles.horizontalSection}>
              <Text style={styles.userName}>{getUserName(userName)}</Text>
              <TouchableOpacity style={styles.signOutButton} onPress={() => handleLoginPress()
              }>
                <Text style={styles.logOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>


        </Animated.View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  button: {
    padding: 10,
  },

  iconBackground: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
  },

  menu: {
    position: 'absolute',
    top: -40, 
    left: -20, 
    height: screenHeight, // Full height of the screen
    backgroundColor: 'white',
    zIndex: 10000, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },

  closeButton: {
    position: 'absolute',
    top: 10, 
    left: 10,
    padding: 10,
  },
  menuButton: {
    // marginTop: 20, 
    padding: 10,
    backgroundColor: 'white', 
    borderRadius: 5,
    //alignItems: 'center',
    marginHorizontal: 20,
  },
  menuButtonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },

  test: {
    marginTop: 80
  },

  sectionHeader : {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    marginHorizontal: 20,
    color: 'grey'
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 30,
    marginHorizontal: 20,
    color: 'black',
  },

  loggedInText: {
    fontSize: 14,
    marginTop: 10,
    marginHorizontal: 20,
    color: 'grey'
  },

  logOutText: {
    fontSize: 14,
    marginVertical: 10,
    marginHorizontal: 20,
    color: 'rgb(37, 163, 250)'
  },
  
  loggedInSection: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },

  horizontalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  signOutButton: {
    marginBottom: 30,
    padding: 0,
    borderRadius: 5,
  },

});

export default Navigation;