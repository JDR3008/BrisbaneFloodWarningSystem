import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface Notification {
  message: string;
  date: string;
  severity: string;
}

interface NotificationsPopupProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
}

/**
 * This component is responsible for the pop up of notificaitons on the application.
 * @param param0 - set of parameters that are responsible for whether the user can recieve notifcations
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ visible, notifications, onClose }) => {
  if (!visible) return null;

  /**
   * gets the colour of the severity of the flood
   * @param severity - a string of the severity of the flood
   * @returns {string} - colour code of the danger
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Major':
        return '#FF4C4C';
      case 'Moderate':
        return '#FFA500';
      case 'Minor':
        return '#4CAF50';
      default:
        return '#4CAF50';
    }
  };

  // check how many days away the notification is set for
    const getDaysAway = (date: string) => {
        const today = new Date();
        const notificationDate = new Date(date);
        const timeDiff = notificationDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff;
    };


  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.popup}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Flood Alerts</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.notificationItem}>
                <Text style={styles.notificationDate}>Starts in {getDaysAway(item.date)} days</Text>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{item.message.split('.')[0]}</Text>
                </View>
                <View style={styles.notificationDetails}>
                  <Text style={[styles.notificationSeverity, { color: getSeverityColor(item.severity) }]}>
                    {item.severity} Risk
                  </Text>
                  <FontAwesome name="map-marker" size={16} color="#666" style={styles.locationIcon} />
                  <Text style={styles.notificationDate}>Current Location</Text>
                </View>
                <Text style={styles.notificationDescription}>Message: {item.message}</Text>
                <Text style={styles.notificationDate}>Date: {item.date}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    width: '100%',
    height: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  notificationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#333',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  notificationSeverity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  locationIcon: {
    marginLeft: 10,
  },
});

export default NotificationsPopup;
