import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * The necessities page is responsible for the user being able to see what they need to have during a flood
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const Necessities: React.FC = () => {
  const navigation = useNavigation(); // Use React Navigation hook to navigate back
  const [activeTab, setActiveTab] = useState<'Stockpile' | 'Backpack'>('Stockpile');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [acquiredItems, setAcquiredItems] = useState<string[]>([]);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [tip, setTip] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [progress, setProgress] = useState(new Animated.Value(0));

  // emergency tips displayed on page
  const emergencyTips = [
    'Always keep a whistle in your backpack. It can help you signal for help.',
    'Store non-perishable food items that can last at least 3 days.',
    'A multi-tool can be useful for a variety of emergency tasks.',
    'Always carry extra batteries for your flashlight.',
    'Having a firestarter or waterproof matches can be a lifesaver in cold conditions.',
  ];

  // backpack items for the backpack variant of necessities
  const backpackItems = [
    { name: 'Flashlight', image: require('../assets/flashlight.png') },
    { name: 'First Aid Kit', image: require('../assets/first-aid-kit.png') },
    { name: 'Bottled Water', image: require('../assets/water-bottle.png') },
    { name: 'Energy Bars', image: require('../assets/energy-bars.png') },
    { name: 'Portable Radio', image: require('../assets/portable-radio.png') },
  ];

  /**
   * This function sets a state for what necessities tab the user is on
   * @param tab - the tab the user is on
   */
  const toggleTab = (tab: 'Stockpile' | 'Backpack') => {
    setActiveTab(tab);
  };

  /**
   * Expands and collapses the section the user is on
   * @param section - the section of the necessities the user is on
   */
  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  /**
   * When the user clicks an item, it will send an alert to the user. This function handles this process.
   * @param itemName - the backpack item
   */
  const handleItemPress = (itemName: string) => {
    if (!acquiredItems.includes(itemName)) {
      Alert.alert(
        'Acquired Item',
        `Do you have ${itemName} in your emergency backpack?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              setAcquiredItems((prev) => [...prev, itemName]);
              showEmergencyTip();
              updateProgress();
            },
          },
          {
            text: 'More Info',
            onPress: () => setSelectedItem(itemName),
          },
        ]
      );
    }
  };

  /**
   * Show the emergency tip for each of the items
   */
  const showEmergencyTip = () => {
    const randomTip = emergencyTips[Math.floor(Math.random() * emergencyTips.length)];
    setTip(randomTip);
    setShowTip(true);
  };

  /**
   * Closes the modal by setting a state
   */
  const closeModal = () => {
    setSelectedItem(null);
  };

  /**
   * Updates the number of items in the backpack
   */
  const updateProgress = () => {
    const newProgress = (acquiredItems.length + 1) / backpackItems.length;
    Animated.timing(progress, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Necessities</Text>

      {/* Toggle Button for Stockpile and Backpack */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Stockpile' && styles.activeTab]}
          onPress={() => toggleTab('Stockpile')}
        >
          <Text style={[styles.tabText, activeTab === 'Stockpile' && styles.activeTabText]}>Stockpile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Backpack' && styles.activeTab]}
          onPress={() => toggleTab('Backpack')}
        >
          <Text style={[styles.tabText, activeTab === 'Backpack' && styles.activeTabText]}>Backpack</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Stockpile' ? (
        <>
          <Text style={styles.description}>
            Keep these items with you at any time when you leave home.
          </Text>

          {/* Scrollable list of sections for Stockpile */}
          <ScrollView>
            {/* Food and Water Section */}
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('FoodAndWater')}>
              <Text style={styles.sectionHeaderText}>Food and Water</Text>
              <Ionicons name={expandedSection === 'FoodAndWater' ? 'chevron-up' : 'chevron-down'} size={24} />
            </TouchableOpacity>
            {expandedSection === 'FoodAndWater' && (
              <View style={styles.sectionContent}>
                <Text style={styles.item}>• Bottled water (enough for at least 3 days)</Text>
                <Text style={styles.item}>• High-energy snacks (e.g., energy bars, dried fruits, or compact food like emergency rations)</Text>
                <TouchableOpacity>
                  <Text style={styles.link}>How to obtain</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Important Documents Section */}
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('Documents')}>
              <Text style={styles.sectionHeaderText}>Important Documents</Text>
              <Ionicons name={expandedSection === 'Documents' ? 'chevron-up' : 'chevron-down'} size={24} />
            </TouchableOpacity>
            {expandedSection === 'Documents' && (
              <View style={styles.sectionContent}>
                <Text style={styles.item}>• Passports, IDs, and other important documents</Text>
              </View>
            )}

            {/* Communication and Lighting Section */}
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('Communication')}>
              <Text style={styles.sectionHeaderText}>Communication and Lighting</Text>
              <Ionicons name={expandedSection === 'Communication' ? 'chevron-up' : 'chevron-down'} size={24} />
            </TouchableOpacity>
            {expandedSection === 'Communication' && (
              <View style={styles.sectionContent}>
                <Text style={styles.item}>• Flashlight and extra batteries</Text>
                <Text style={styles.item}>• Portable radio</Text>
              </View>
            )}

            {/* Medical Supplies Section */}
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('Medical')}>
              <Text style={styles.sectionHeaderText}>Medical Supplies</Text>
              <Ionicons name={expandedSection === 'Medical' ? 'chevron-up' : 'chevron-down'} size={24} />
            </TouchableOpacity>
            {expandedSection === 'Medical' && (
              <View style={styles.sectionContent}>
                <Text style={styles.item}>• First-aid kit</Text>
                <Text style={styles.item}>• Prescription medications</Text>
              </View>
            )}

            {/* Items for Aged People Section */}
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('AgedPeople')}>
              <Text style={styles.sectionHeaderText}>Items For Aged People</Text>
              <Ionicons name={expandedSection === 'AgedPeople' ? 'chevron-up' : 'chevron-down'} size={24} />
            </TouchableOpacity>
            {expandedSection === 'AgedPeople' && (
              <View style={styles.sectionContent}>
                <Text style={styles.item}>• Walking aids</Text>
                <Text style={styles.item}>• Medical equipment</Text>
              </View>
            )}

            {/* Items for Kids Section */}
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('Kids')}>
              <Text style={styles.sectionHeaderText}>Items for Kids</Text>
              <Ionicons name={expandedSection === 'Kids' ? 'chevron-up' : 'chevron-down'} size={24} />
            </TouchableOpacity>
            {expandedSection === 'Kids' && (
              <View style={styles.sectionContent}>
                <Text style={styles.item}>• Baby food, diapers, and other baby necessities</Text>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        <>
          {/* Backpack view: List of essential items with pressable icons */}
          <Text style={styles.description}>Items to carry in your emergency backpack.</Text>
          <ScrollView>
            <Text style={styles.sectionHeaderText}>Backpack Items</Text>
            <View style={styles.itemList}>
              {backpackItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.backpackItem,
                    acquiredItems.includes(item.name) && styles.acquiredItem,
                  ]}
                  onPress={() => handleItemPress(item.name)}
                >
                  <Image source={item.image} style={styles.itemImage} />
                  <Text
                    style={[
                      styles.itemText,
                      acquiredItems.includes(item.name) && styles.acquiredItemText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <Text>Progress: {Math.round((acquiredItems.length / backpackItems.length) * 100)}%</Text>
              <Animated.View style={[styles.progressBar, { width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }) }]} />
            </View>

            {/* Acquired Items */}
            {acquiredItems.length > 0 && (
              <View style={styles.acquiredSection}>
                <Text style={styles.acquiredHeader}>Acquired Items</Text>
                {acquiredItems.map((item, index) => (
                  <Text key={index} style={styles.acquiredText}>
                    {item}
                  </Text>
                ))}
              </View>
            )}


          </ScrollView>

          {/* Emergency Tip */}
          {showTip && (
            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>{tip}</Text>
              <TouchableOpacity onPress={() => setShowTip(false)}>
                <Text style={styles.tipClose}>Got it!</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedItem}</Text>
              <Text style={styles.modalText}>
                This is why having {selectedItem} is important in an emergency situation...
              </Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 20,
    alignSelf: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#32CD32',
    borderColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionContent: {
    paddingVertical: 10,
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  item: {
    fontSize: 16,
    marginBottom: 5,
  },
  link: {
    color: '#007bff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  backpackItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  acquiredItem: {
    backgroundColor: '#32CD32',
  },
  itemImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
  },
  acquiredItemText: {
    color: '#fff',
  },
  acquiredSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  acquiredHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  acquiredText: {
    fontSize: 16,
    color: '#333',
  },
  progressBarContainer: {
    marginTop: 0,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#32CD32',
    borderRadius: 5,
  },
  tipContainer: {
    backgroundColor: '#ffffcc',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  tipText: {
    fontSize: 16,
    color: '#666',
  },
  tipClose: {
    color: '#32CD32',
    fontWeight: 'bold',
    marginTop: 10,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  modalCloseButton: {
    backgroundColor: '#32CD32',
    padding: 10,
    borderRadius: 5,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Necessities;
