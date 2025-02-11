import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * The help centre page is responsible for allowing users the ability to clarify their 
 * understanding about different aspects of the application.
 * 
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const Help = () => {
  const navigation = useNavigation();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  // Help topics data
  const helpTopics = [
    { 
      title: 'Emergency Contact', 
      description: 'If you feel you are in danger, call emergency services at 000',
      icon: <Ionicons name="call-outline" size={24} color="black" /> 
    },
    { 
      title: 'Report a problem', 
      description: 'For all issues regarding the appplication, please do not hesitate to contact us at floodify@email.com', 
      icon: <Ionicons name="alert-circle-outline" size={24} color="black" /> 
    },
    { 
      title: 'Data and Privacy', 
      description: 'At Floodify, we ensure that your data is protected. If you do not wish to provide your data you can choose to disable it in the settings', 
      icon: <Ionicons name="lock-closed-outline" size={24} color="black" /> 
    },
    { 
      title: 'Troubleshooting', 
      description: 'Please do not hesitate to contact us at floodify@email.com if you are experiencing any troubleshooting', 
      icon: <Ionicons name="settings-outline" size={24} color="black" /> 
    },
    { 
      title: 'User Guide', 
      description: 'Floodify has numerous features that are useful.\n\n1. Map Page:\nThe map page is the central hub of Floodify, on this page you will see different flood zones in relation to your current location. On this page you can see if your saved locations are also in flood zones or not. See your current alerts regarding flood risks. Please see the provided legend to understand what all the icons mean.\n\n2. Necessities:\nThis page allows you to ensure that you have the correct materials in a flood. It gives you some tips as what is needed to be safe in a flood.\n\n3. Flood Preparation/InFlood To-Do List\nThese pages are responsible for providing you educational details on what to do before and during a flood.\n\n4. Find A Shelter\nThis page allows you to view all the shelters that are currently in active in Brisbane and in our database. Use this page to find the closest one and locate it on the map.\n\n5. Settings\nUse this page to update all your preferences to do with Floodify: add new saved addresses, update your work/home address and toggle your location and notificifation settings\n\n6. Info Page\nUse this page to get a detailed view of your flood alerts in Brisbane. See a snapshot of the current weather.', 
      icon: <FontAwesome name="book" size={24} color="black" /> 
    },
    { 
      title: 'Security', 
      description: 'Ensure your security by utilising the settings to toggle your preferences.', 
      icon: <MaterialIcons name="security" size={24} color="black" /> 
    },
  ];

  // FAQ data
  const faqs = [
    { 
      question: 'How are flood risk areas determined?', 
      description: 'Flood risk areas are determined using a combination of historical data and weather patterns. We use an API to display this data on the map which ranges from very mild to extreme risks during a flood. Please take note of these high risk areas, you will want to avoid these during a flood.' 
    },
    { 
      question: 'How can I customise flood alert notifications?', 
      description: 'You can choose whether you want to recieve notications from Floodify by doing into the settings and toggling push notifications. When this is not enabled you will not recieve notifcations from us.' 
    },
    { 
      question: 'How do I find safe evacuation routes?', 
      description: 'On the map page, you will automatically be routed to the nearest safe shelter. If you wish to view all these evacuation routes, you can use the Find A Shelter page to view all safe shelters which you can evacuate to. When you click start on a shelter, you will be provided with a route to it and the estimated time to get there.' 
    },
    { 
      question: 'What data does the app use to predict floods?', 
      description: 'We use an machine mearning model to predict flooding in Brisbane. This takes in current weather data and compares to it to historical weather data in Brisbane. We have a successful prediction rate of over 99%!' 
    },
    { 
      question: 'Will my data be shared with third parties?', 
      description: 'No, your data will not be shared without your consent. The only data we need is your location and this can be toggled off in the settings if the you wish!' 
    },
  ];

  /**
   * This function allows for the menu items to be toggled from expanded to collapsed
   * @param title - the faq or title being toggled
   */
  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Help Centre</Text>

        {/* Help Topics List */}
        {helpTopics.map((topic, index) => (
          <TouchableOpacity key={index} onPress={() => toggleSection(topic.title)}>
            <View style={styles.helpItem}>
              <View style={styles.helpItemContent}>
                {topic.icon}
                <Text style={styles.helpItemText}>{topic.title}</Text>
              </View>
              <Ionicons 
                name={expandedSections[topic.title] ? 'chevron-down-outline' : 'chevron-up-outline'} 
                size={20} 
                color="black" 
              />
            </View>
            {expandedSections[topic.title] && (
              <Text style={styles.description}>{topic.description}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* FAQs Section */}
        <Text style={styles.faqTitle}>FAQs</Text>
        {faqs.map((faq, index) => (
          <TouchableOpacity key={index} onPress={() => toggleSection(faq.question)}>
            <View style={styles.faqItem}>
              <Text style={styles.faqText}>{faq.question}</Text>
              <Ionicons 
                name={expandedSections[faq.question] ? 'chevron-down-outline' : 'chevron-up-outline'} 
                size={20} 
                color="black" 
              />
            </View>
            {expandedSections[faq.question] && (
              <Text style={styles.description}>{faq.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  helpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  helpItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  faqText: {
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#00C853',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 20,
    marginHorizontal: 40,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

export default Help;
