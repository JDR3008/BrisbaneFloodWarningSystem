import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.utils import resample
import joblib
import os

# Delete the existing model and scaler to start fresh
model_filename = 'flood_prediction_model.pkl'
scaler_filename = 'scaler.pkl'
if os.path.exists(model_filename):
    os.remove(model_filename)
if os.path.exists(scaler_filename):
    os.remove(scaler_filename)

# Read the CSV file
data = pd.read_csv('DailyHistoricalRain.csv')

# Create new cumulative features over different days
data['Rainfall_1_day'] = data['Rainfall amount (millimetres)'].shift(1).fillna(0)
data['Rainfall_2_days'] = data['Rainfall amount (millimetres)'].shift(2).fillna(0)
data['Rainfall_3_days'] = data['Rainfall amount (millimetres)'].shift(3).fillna(0)
data['Cumulative_3_days'] = data['Rainfall amount (millimetres)'] + data['Rainfall_1_day'] + data['Rainfall_2_days'] + data['Rainfall_3_days']

data['Rainfall_5_days'] = data['Rainfall amount (millimetres)'].shift(5).fillna(0)
data['Cumulative_5_days'] = data['Cumulative_3_days'] + data['Rainfall_5_days']

data['Rainfall_7_days'] = data['Rainfall amount (millimetres)'].shift(7).fillna(0)
data['Cumulative_7_days'] = data['Cumulative_5_days'] + data['Rainfall_7_days']

data['Rainfall_10_days'] = data['Rainfall amount (millimetres)'].shift(10).fillna(0)
data['Cumulative_10_days'] = data['Cumulative_7_days'] + data['Rainfall_10_days']

data['Rainfall_14_days'] = data['Rainfall amount (millimetres)'].shift(14).fillna(0)
data['Cumulative_14_days'] = data['Cumulative_10_days'] + data['Rainfall_14_days']

# Label flooding severity based on cumulative rainfall
def map_flooding(row):
    if row['Cumulative_14_days'] > 250:  # Major flooding
        return 3
    elif row['Cumulative_14_days'] > 150:  # Moderate flooding
        return 2
    elif row['Cumulative_14_days'] > 100:  # Minor flooding
        return 1
    else:
        return 0  # No flooding

# Apply the flood severity mapping function
data['flood_severity'] = data.apply(map_flooding, axis=1)

# Select the relevant features and target variable
X = data[['Rainfall amount (millimetres)', 'Cumulative_3_days', 'Cumulative_5_days', 'Cumulative_7_days', 'Cumulative_10_days', 'Cumulative_14_days']]
y = data['flood_severity']

# Handle data imbalance by upsampling the minority flood classes
df = pd.concat([X, y], axis=1)

# Separate majority and minority classes
df_majority = df[df['flood_severity'] == 0]
df_minority = df[df['flood_severity'] > 0]

# Upsample minority class
df_minority_upsampled = resample(df_minority, 
                                 replace=True,     # sample with replacement
                                 n_samples=len(df_majority),    # to match majority class
                                 random_state=42)  # reproducible results

# Combine majority class with upsampled minority class
df_upsampled = pd.concat([df_majority, df_minority_upsampled])

# Separate back into X and y
X = df_upsampled.drop('flood_severity', axis=1)
y = df_upsampled['flood_severity']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize a new scaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save the scaler
joblib.dump(scaler, scaler_filename)

# Initialize and train the RandomForestClassifier with three levels of flooding
model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
model.fit(X_train_scaled, y_train)

# Save the updated model
joblib.dump(model, model_filename)

# Evaluate the model
accuracy = model.score(X_test_scaled, y_test)
print("Model accuracy:", accuracy)

# Print the feature importance to see which features are contributing the most to the predictions
feature_importances = pd.DataFrame(model.feature_importances_, index=X.columns, columns=['Importance']).sort_values(by='Importance', ascending=False)
print("Feature importances:\n", feature_importances)