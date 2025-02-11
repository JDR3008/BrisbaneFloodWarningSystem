import React, { useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Asset } from 'expo-asset';
import { ref, push, get, child } from 'firebase/database';
import { auth, database } from '../firebaseConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * This component is responsible for allowing the user to recieve notifications on the map page of the application.
 * @param param0 - the flood data that is passed through in order to send notifications to the user
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const NotificationComponent: React.FC<{ floodData: { date: string; prediction: number }[], notificationSent: boolean, setNotificationSent: (sent: boolean) => void }> = ({ floodData, notificationSent, setNotificationSent }) => {
  
  // add listener for notifications
  useEffect(() => {
    registerForPushNotificationsAsync();

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received in foreground:", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response received:", response);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Check if flood data is available and notification has not been sent, esnure same notification is not sent multiple times
  useEffect(() => {
    if (floodData.length > 0 && !notificationSent) { 
      sendFloodAlerts(floodData);
      setNotificationSent(true);
    }
  }, [floodData, notificationSent]);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log(`Existing permission status: ${existingStatus}`);
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log(`Requested permission status: ${finalStatus}`);
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(`Push token: ${token}`);
    } else {
      Alert.alert('Error', 'Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  };

  /**
   * This function allows for the user to be sent flood alerts based off the flood data
   * @param floodData - the flood data required to create the alert
   * @returns {user} - if the user is logged in, return
   */
  const sendFloodAlerts = async (floodData: { prediction: number; date: any; }[]) => {
    try {
      const localAsset = Asset.fromModule(require('../assets/house-vector-icon.png'));
      await localAsset.downloadAsync();
  
      const user = auth.currentUser; // Get the current user
      if (!user) return; // Ensure a user is logged in
  
      const notificationsRef = ref(database, `users/${user?.uid}/notifications`);
  
      // Fetch existing notifications
      const snapshot = await get(notificationsRef);
      const existingNotifications = snapshot.exists() ? snapshot.val() : {};
  
      floodData.forEach(async (item: { prediction: number; date: any; }) => {
        if (item.prediction > 0) { // Check if flooding is predicted
          const severity = item.prediction === 1 ? 'Minor' : item.prediction === 2 ? 'Moderate' : 'Major';
  
          // Check if a notification with the same date and severity already exists
          const isDuplicate = Object.values(existingNotifications).some((notification: any) => 
            notification.date === item.date && notification.severity === severity
          );
  
          if (!isDuplicate) {
            // Schedule the notification
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Flood Alert: ${severity} Flooding Predicted`,
                body: `Flooding predicted on ${item.date}. Severity: ${severity}.`,
                data: { data: 'flood alert' },
                sound: 'default', // Play default sound
                badge: 1, // Set badge number
                attachments: [
                  {
                    url: localAsset.localUri ? localAsset.localUri.replace('file://', '') : null,
                    identifier: 'image',
                    type: 'image/png',
                  },
                ],
              },
              trigger: { seconds: 2 }, // Notification triggers in 2 seconds
            });
  
            // Save the notification details to the Firebase Realtime Database
            await push(notificationsRef, {
              date: item.date,
              severity: severity,
              message: `Flooding predicted on ${item.date}. Severity: ${severity}.`,
              timestamp: new Date().toISOString(),
            });
  
            console.log(`Flood alert scheduled and saved for ${item.date} with severity ${severity}`);
          } else {
            console.log(`Duplicate notification for ${item.date} with severity ${severity} was not saved.`);
          }
        }
      });
    } catch (error) {
      console.error("Failed to schedule notification and save to database:", error);
      Alert.alert('Error', 'Failed to schedule notification and save to database.');
    }
  };

  return (
    <View style={styles.container} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationComponent;