/**
 * Fetches the rain data from the API set up on the cloud consisting of the ML model and its subsequent scripts
 * @param {*} rainData  - array of rain data
 * @returns {Promise} - the response from the API
 */
export async function predictFlooding(rainData) {
    try {
      const response = await fetch('https://deco3801-431922.ts.r.appspot.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rain_data: rainData }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
  
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }