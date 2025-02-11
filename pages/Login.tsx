import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';  
import { auth, database } from '../firebaseConfig';  // Import initialized auth and database from firebaseConfig
import { useNavigation, NavigationProp } from '@react-navigation/native';  
import { RootStackParamList } from '../app/index';  // Import RootStackParamList

/**
 * The login page is responsible for the user being able to log in as per the real time firebase
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const LoginPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use typed navigation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Checks the credentials of the login data in relation to the firebase
   */
  const handleLogin = async () => {
    try {
      // Authenticate user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Realtime Database
      const userRef = ref(database, `/users/${user.uid}`);  // Use ref with the initialized database
      const snapshot = await get(userRef);  // Use get to fetch the snapshot

      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log('User data:', userData);
        
        // Navigate to MapViewComponent after successful login
        navigation.navigate('MapViewComponent');
      } else {
        console.log('No user data found!');
      }
    } catch (error) {
      Alert.alert('Login Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log-in</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={"#ccc"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={"#ccc"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log in</Text>
      </TouchableOpacity>
      <Text style={styles.or}>or</Text>
      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('SignUpPage')}>
        <Text style={styles.signupButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  loginButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 5,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  or: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
    color: '#666',
  },
  signupButton: {
    borderColor: 'black',
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: 5,
  },
  signupButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginPage;