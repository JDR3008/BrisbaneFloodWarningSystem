from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import traceback

app = Flask(__name__)
CORS(app)

# Load the model and scaler
model = joblib.load('flood_prediction_model.pkl')
scaler = joblib.load('scaler.pkl')

def predict_flooding(rain_data):
    try:
        columns = ['Year', 'Month', 'Day', 'Rainfall amount (millimetres)']
        rain_df = pd.DataFrame(rain_data, columns=columns)

        # Create cumulative features based on rainfall
        rain_df['Rainfall_1_day'] = rain_df['Rainfall amount (millimetres)'].shift(1).fillna(0)
        rain_df['Rainfall_2_days'] = rain_df['Rainfall amount (millimetres)'].shift(2).fillna(0)
        rain_df['Rainfall_3_days'] = rain_df['Rainfall amount (millimetres)'].shift(3).fillna(0)
        rain_df['Cumulative_3_days'] = rain_df['Rainfall amount (millimetres)'] + rain_df['Rainfall_1_day'] + rain_df['Rainfall_2_days'] + rain_df['Rainfall_3_days']
        rain_df['Rainfall_5_days'] = rain_df['Rainfall amount (millimetres)'].shift(5).fillna(0)
        rain_df['Cumulative_5_days'] = rain_df['Cumulative_3_days'] + rain_df['Rainfall_5_days']
        rain_df['Rainfall_7_days'] = rain_df['Rainfall amount (millimetres)'].shift(7).fillna(0)
        rain_df['Cumulative_7_days'] = rain_df['Cumulative_5_days'] + rain_df['Rainfall_7_days']

        # Add longer-term cumulative features for prediction
        rain_df['Rainfall_10_days'] = rain_df['Rainfall amount (millimetres)'].shift(10).fillna(0)
        rain_df['Cumulative_10_days'] = rain_df['Cumulative_7_days'] + rain_df['Rainfall_10_days']

        rain_df['Rainfall_14_days'] = rain_df['Rainfall amount (millimetres)'].shift(14).fillna(0)
        rain_df['Cumulative_14_days'] = rain_df['Cumulative_10_days'] + rain_df['Rainfall_14_days']

        # Prepare the features for each day
        prediction_features = rain_df[['Rainfall amount (millimetres)', 'Cumulative_3_days', 'Cumulative_5_days', 'Cumulative_7_days', 'Cumulative_10_days', 'Cumulative_14_days']]

        # Scale the features for each day
        scaled_features = scaler.transform(prediction_features)

        # Predict for each day in the rain_data
        predictions = model.predict(scaled_features)

        # Prepare the response in the same format as before
        response = []
        for i in range(len(rain_data)):
            response.append({
                'date': f"{rain_data[i][0]}-{rain_data[i][1]:02d}-{rain_data[i][2]:02d}",
                'prediction': int(predictions[i])
            })

        return response

    except Exception as e:
        print("Error occurred:", str(e))
        traceback.print_exc()
        raise e

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json['rain_data']
        predictions = predict_flooding(data)
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
