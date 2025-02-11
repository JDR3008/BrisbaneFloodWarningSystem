import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebaseConfig';  // Import initialized auth and database from firebaseConfig
import { useNavigation, NavigationProp } from '@react-navigation/native';  // Import useNavigation
import { RootStackParamList } from '../app/index';  // Import RootStackParamList

/**
 * The sign up page allows the user to sign up with an account, data is saved in Firebase
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const SignUpPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use typed navigation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Add details to the firebase with their email and password
   */
  const handleSignUp = async () => {
    try {
      // Create a new user with Firebase Authenticator
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the new user's data in the Realtime Database
      const userRef = ref(database, `/users/${user.uid}`);  // Use ref with the initialized database
      await set(userRef, {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Sign Up', 'User created successfully!');
      // Navigate to MapViewComponent after successful sign up
      navigation.navigate('MapViewComponent');
    } catch (error) {
      Alert.alert('Sign Up Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.or}>or</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('LoginPage')}>
        <Text style={styles.loginButtonText}>Log in</Text>
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
  signupButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 5,
    marginBottom: 16,
  },
  signupButtonText: {
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
  loginButton: {
    borderColor: 'black',
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignUpPage;