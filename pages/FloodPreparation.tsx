import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

/**
 *  This component is the flood preparation page of the application
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
                <Text style={styles.title}>Preparation</Text>
            </View>

            {/* Step 1 */}
            <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContentContainer}>
                    <Text style={styles.stepTitle}>Prepare an Emergency Kit</Text>
                    
                    <Text style={styles.sectionTitle}>Food and Water</Text>
                    <Text style={styles.sectionContent}>
                        Pack at least 3 days’ worth of non-perishable food and clean drinking water (1 gallon per person per day).
                    </Text>

                    <Text style={styles.sectionTitle}>Lighting and Power Supplies</Text>
                    <Text style={styles.sectionContent}>
                        Have flashlights and extra batteries ready. Also, make sure portable phone chargers (power banks) are fully charged.
                    </Text>

                    <Text style={styles.sectionTitle}>First-Aid Kit</Text>
                    <Text style={styles.sectionContent}>
                        Include essential items like bandages, antiseptics, any necessary prescription medications, and over-the-counter painkillers.
                    </Text>

                    <Text style={styles.sectionTitle}>Important Documents</Text>
                    <Text style={styles.sectionContent}>
                        Store identification (ID cards, passports, insurance papers, etc.) in a waterproof bag.
                    </Text>

                    <Text style={styles.sectionTitle}>Cash</Text>
                    <Text style={styles.sectionContent}>
                        Have enough cash on hand, as ATMs and card payment systems might not work during a flood.
                    </Text>
                </View>
                
            </View>

            <Image 
                source={require("../assets/emergency-kit.png")} 
                style={styles.image} 
                resizeMode="contain" 
            />

            {/* Step 2 */}
            <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContentContainer}>
                    <Text style={styles.stepTitle}>Secure Your Home</Text>

                    <Text style={styles.sectionTitle}>Install Sandbags</Text>
                    <Text style={styles.sectionContent}>
                        Place sandbags around doors and entryways to block water from entering your home.
                    </Text>

                    <Text style={styles.sectionTitle}>Elevate Appliances and Electronics:</Text>
                    <Text style={styles.sectionContent}>
                        Move valuables, electronics, and essential appliances to higher ground.
                    </Text>

                    <Text style={styles.sectionTitle}>Turn Off Utilities:</Text>
                    <Text style={styles.sectionContent}>
                        In case of evacuation, shut off water, gas, and electricity to prevent further damage or safety risks.
                    </Text>

                    <Text style={styles.sectionTitle}>Inspect Drains and Gutters:</Text>
                    <Text style={styles.sectionContent}>
                        Clean and clear drains and gutters to ensure proper water flow and reduce the risk of flooding your home.
                    </Text>
                </View>
            </View>

            <Image 
                source={require("../assets/sandbag.png")} 
                style={styles.image} 
                resizeMode="contain" 
            />

            {/* Step 3 */}
            <View style={styles.stepContainer}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContentContainer}>
                    <Text style={styles.stepTitle}>Stay Informed</Text>

                    <Text style={styles.sectionTitle}>Sign Up for Alerts:</Text>
                    <Text style={styles.sectionContent}>
                        Subscribe to local flood alerts through the flood app or other local emergency services.
                    </Text>

                    <Text style={styles.sectionTitle}>Monitor Weather Updates:</Text>
                    <Text style={styles.sectionContent}>
                        Regularly check weather forecasts and local news, especially when rainstorms are expected.
                    </Text>

                    <Text style={styles.sectionTitle}>Follow Evacuation Orders:</Text>
                    <Text style={styles.sectionContent}>
                        If authorities issue a mandatory evacuation order, leave immediately.
                    </Text>
                </View>
            </View>

            <TouchableOpacity>
                <Text style={styles.linkText}>More about items</Text>
            </TouchableOpacity>

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
    },
});

export default FloodPreparation;
