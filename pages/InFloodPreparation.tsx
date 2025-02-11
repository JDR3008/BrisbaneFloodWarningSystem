import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../app/index"; // Import RootStackParamList
import { useNavigation, NavigationProp } from "@react-navigation/native";

/**
 *  This component is the flood preparation page of the application displaying actions to take while a flood is happening.
 * @returns {JSX.Element} This returns the view for the page, it uses a series of imports from react native to do so.
 */
const FloodPreparation: React.FC = () => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        navigation.goBack(); // Navigate back to the previous screen
    };



    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>In-Flood</Text>
            </View>

            {/* Step 1 */}
            <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContentContainer}>
                    <Text style={styles.stepTitle}>Stay Informed and Follow Alerts</Text>
                    
                    <Text style={styles.sectionTitle}>Receive Alerts</Text>
                    <Text style={styles.sectionContent}>
                        Ensure your flood app's push notifications are on to receive the lastest warnings and flood updates.
                    </Text>

                    <Text style={styles.sectionTitle}>Monitor Official Channels</Text>
                    <Text style={styles.sectionContent}>
                        Listen to local radio, watch TV news, or follow official social media accounts of your local government for official updates. 
                    </Text>

                    <Text style={styles.sectionTitle}>Heed Evacuation Orders</Text>
                    <Text style={styles.sectionContent}>
                        If authorities issue an evacuation order, do not delay. Follow the instructions immediately to ensure your safety. 
                    </Text>
                </View>
                
            </View>


            <Image 
                source={require("../assets/alert.png")} 
                style={styles.image} 
                resizeMode="contain" 
            />

            {/* Step 2 */}
            <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContentContainer}>
                    <Text style={styles.stepTitle}>Prepare for Evacuation</Text>

                    <Text style={styles.sectionTitle}>Take Emergency Kit</Text>
                    <Text style={styles.sectionContent}>
                        Ensure your emergency kit (prepared earlier) is with you. Take essential items such as food, water, important documents, and any needed medication.
                    </Text>

                    <Text style={styles.sectionTitle}>Turn off Utilities</Text>
                    <Text style={styles.sectionContent}>
                        Before leaving your home, turn off water, gas and electricity to prevent leaks, fires or electrocution if the flood water rises.
                    </Text>

                    <Text style={styles.sectionTitle}>Secure your home</Text>
                    <Text style={styles.sectionContent}>
                        If time permits, lock windows and doors, move valuables to higher levels, and place sand bags around doors to protect against rising waters.
                    </Text>

                    <Text style={styles.sectionTitle}>Use designated Routes</Text>
                    <Text style={styles.sectionContent}>
                        Follow the safe evacuation routes you've previously planned. Avoid flooded or low-lying roads. 
                    </Text>
                </View>
            </View>


            {/* Step 3 */}
            <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContentContainer}>
                    <Text style={styles.stepTitle}>Move to the Shelter</Text>

                    <Text style={styles.sectionTitle}>Avoid Flooded Zones </Text>
                    <Text style={styles.sectionContent}>
                        Never attempt to walk or drive through floodwaters, as water depth and currents can be deceivingly dangerous. 
                    </Text>

                    <Text style={styles.sectionTitle}>Keep your pets safe</Text>
                    <Text style={styles.sectionContent}>
                        Ensure your pets are with you in a safe area and avoid leaving them behind. 
                    </Text>
                </View>
            </View>


            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    header: {
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    stepNumber: {
        backgroundColor: "#32CD32",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    stepNumberText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    stepContentContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "bold",
        marginTop: 25,
        color: "#333",
    },
    sectionContent: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
    },
    linkText: {
        color: "#1E90FF",
        fontSize: 14,
        marginTop: 10,
    },
    image: {
        width: "100%",
        height: 150,
        marginTop: 20,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#32CD32",
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 10,
        fontWeight: "bold",
    },
});

export default FloodPreparation;