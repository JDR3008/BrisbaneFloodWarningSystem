# Floodify

<img width="589" alt="Screenshot 2024-10-18 at 10 48 45 AM" src="https://github.com/user-attachments/assets/c231e6d5-9c8b-414c-91dc-45fdc2c2f2c0" />

<img width="567" alt="Screenshot 2024-10-18 at 10 51 10 AM" src="https://github.com/user-attachments/assets/e1602240-d7a0-4311-b029-d7c72814cab9" />

<img width="595" alt="Screenshot 2024-10-18 at 10 53 57 AM" src="https://github.com/user-attachments/assets/24368a3b-1a70-4cac-92fd-01d330877f27" />

<img width="276" alt="Screenshot 2024-10-18 at 10 56 15 AM" src="https://github.com/user-attachments/assets/e7a55362-f82a-4ad5-a05c-b3c9b7fcd10f" />

## GitHub Link
https://github.com/Joel1414/FloodApp.git

## Description
Floodify is a mobile application designed to provide real-time updates and information about flood conditions near a user’s location. It aims to help users stay informed and take the necessary precautions during flood events throughout Brisbane. The flood app users various AI and machine learning models to provide data driven insights into flood events, providing information such as flood alerts, flood levels, shelter information, as well as insightful tips on how to prepare and act during flood events that may occur. We built Floodify with usability in mind, and to ensure that users receive the most up to date, and necessary information to be prepared for any flood event. 

### Features
The Floodify application has been developed with the following features:

- Real time flood updates: The app fetches data from reliable sources and displays real-time information about flood conditions in different locations. 
- Interactive map: Users can view a map that shows flood-prone areas and current flood levels. They can also zoom in and out to get a better understanding of the specific locations that have been affected. 
- Notifications: Users can enable push notifications to receive alerts aout flood warnings, updates, and safety recommendations.
- Emergency Contacts: The app provides a list of emergency contacts, including local authorities, rescue services and helpline numbers for quick access during flood emergencies. 
- Safety tips: Floodift offers valuable safety tips and guidelines to help users prepare for floods, evacuate if necessary, and stay safe during and after flood events.


## Technologies Used
- React Native
- Expo
- Google Maps API (for interactive maps)
- Push Notifications (Using built in functions from react and expo)
- Machine Learning (Random Forest)
- Flask (convert python scripts into APIs)
- Cloud Services
    - Firebase realtime database
    - Firebase authentication
    - Google cloud app engine (used to host ML API)


## Getting Started

This is an example of how you can run the application locally. This section will outline a series of requirements to do so.

### Prerequisites:


Npm:
```sh
  npm install npm@latest -g
  ```

### Installation:

Once you have downloaded the files and installed all the npm packages, then you will need to run it using Expo Go. 

1. Download Expo Go application from the app store
2. Create an account
3. In a terminal at the application path directory, run npx expo start
4. Press ‘s’ to switch to Expo Go
5. Scan the QR code on your phone
6. Open the application by clicking ‘Expo Go’

This will load the application on the Expo Go app.

Alternatively, if you wish to use a simulator, you will click ‘i’ after step 4 to open the simulator for iOS, or ‘a’ for android. Please note that this will require a simulator to be installed on your computer prior to this, such as the one on XCode.


## Files/Folders Description (Structure)

### App:

- [Index](app/index) is responsible for creating a stack navigator that organises the pages of the application. Each page is imported on this page and exported.

### Assets:

- Assets such as the [home](assets/home.png) icon were used throughout the application.

### Components:

- [FloodPredictionTimeline](components/FloodPredictionTimeline) is a component used to predict the floods within a certain timeframe. 
- [Navigation](components/Navigation) is the navigation menu bar of the application that has a hamburger menu, it is accessed from the map page of the application (homepage)
- [NotificationComponent](components/NotificationComponent) is a component that produces an alert in a pop up format when the user is in a flood-prone area.
- [NotificationsPopUp](components/NotificationsPopUp) is a component that is used for displaying the pop ups on the main application.
- [WeatherDisplay](components/WeatherDisplay) is the component used on the [info page](pages/InfoPage), it is a small widget-like component that displays the current weather in Brisbane.

### Pages:

- [Add Saved Address](pages/AddSavedAdress) is a page where the user can input their saved location, e.g., Home or Work and it will save the location to the map for the user. 
- [Find A Shelter](pages/FindAShelter) is a page where the user can find a shelter based on their location. The user can organise these by ‘closest’, ‘furthest’ and ‘alphabetical’
- [Flood Preparation](pages/FloodPreparation) is the page that displays all of the pre-flood information to the user.
- The [Help Centre](pages/Help) is where the user can get some clarity on what to do if they are confused. It includes general information such as a user guide, and a FAQ.
- The [In Flood Preparation](pages/InFloodPreparation) is a page where users can access critical information on what to do if they are in a flood.
- The [info page](pages/InfoPage) is responsible for displaying key alerts about flood trends. This page utilises the AI model to provide accurate predictions. Weather is also displayed.
- The [Map View](pages/MapViewComponent) is the primary hub of the application, it is responsible for displaying all the relevant flood zone data, shelters, and any saved addresses the user has added in the settings. The user can navigate to any of these locations by clicking on the points on the map. Clicking ‘start’ gets directions and starts the trip to these locations. A legend is provided which displays key information on what the flood zone colours, and icons mean. Users can also view alerts by clicking the notification bell in the corner.
- [Necessities](pages/Necessities) is a page where users can view the items needed during a flood, and can create a checklist of items to check off if needed. 
- [Settings] (pages/ Settings) is the page where users can control many back end functions within the application, such as enabling and disabling notifications and location services, as well as updating any other personal information. 
- The [login](pages/Login) page uses Firebase authenticator to let a user sign in.
- The [sign up](pages/SignUp) uses Firebase authenticator to let a user sign up.


### Scripts:

- [api.js](scripts/api.js) is responsible for running the AI model, it uses flask to do so. 
- [FloodSimData](script/FloodSimData) is hardcoded data that produces a flood scenario within the application.
- [Weather](scripts/Weather) is the api for the open weather app, responsible for providing the weather information within the floodify app.

## Team Members

- James de Raat (46420035)
- Sam Holt (47055872)
- Joel Beaton (46427481)
- Lauren Stacey (46987163)
- Timothy(Ziyang) Xu (47612396)
- Lucy Coleman (45808195)
- Selby McIlroy (46968797)
