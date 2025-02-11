<a id="readme-top"></a>

<br></br>

<!-- PROJECT LOGO -->
<h1 align="center">Floodify Machine Learning Codebase</h1>
  <p align="center">
    The following README describes the machine leanring model utalised by our floodify software.
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Description</a></li>
    <li><a href="#contributing">Contributing</a></li>

  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

## Description
This project contains python scripts that were used to both train and utalise our ML model. The model is a random forrest classifier, in which creates multiple decision trees each representing different sections of training data. The model is used to determine flood severity for a set of 7 days based on past and predicited weather data for a two week span.

### Built With

* Python: The language used for training and utalising the model
* Flask: Micro web service used to create a web application to serve as an API to connect to the model.
* Google App Engine: Used to host the Flask application to allow for connection to Floodiy
* SKLearn: An open source machine learning library. In this case it has been used for data splitting, model selection and training, data processing, and model persitence.
* Pandas: An open source data manipulation and analysis library. It has been used for reading data, data manipulation, feature engineering, and data preparation.


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Regarding this section of the project no actions are needed since its service is as a web application hosted on the cloud. This allows the the Floodify app to connect directly to the application with an API call. This cloud service has already been setup so no actin is required.

### Prerequisites (These dont need to be completed by the reader, listing to describe the development process)

* python
  - Downlaod from [python.org](https://www.python.org/)
* pip
  - typically incuded in python installation.
* Google Cloud SDK
  - Required for deployment
  - [cloud.google.com](https://cloud.google.com/sdk/docs/install)
* Virtual environment
  - Venv module installed with python

### Installation (These dont need to be completed by the reader, listing to describe the development process)

1. Create and active the virtual environment
   ```sh
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install python dependancies
   ```sh
   pip install -r requirements.txt
   ```
3. Set up google cloud SDK
   ```sh
   gcloud init
   gcloud auth login
   ```
4. Set up your google cloud project
   ```sh
   gcloud config set project YOUR_PROJECT_ID
   ```
5. Deploy to google app engine
   ```sh
   gcloud app deploy
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

This section defines the functionalities of the main components within this folder. The inputs and expected outputs are listed in addition.

### Train Machine Learning Model
#### Relevant file: [floodTraining.py](/floodTraining.py)

#### Run File:
```sh
python floodTraining.py
```

#### Output:
```sh
model accuracy 'number'
Feature importances
Name                 Importance
'string'             'number'
```

[flood_predict_model.pkl](flood_prediction_model.pkl)

[scaler.pkl](scaler.pkl)


### Use the Machine Learning Model
#### Relevant file: [app.py](/app.py)

#### Run File:
```sh
python app.py
```

Open another Terminal
```sh
curl -X POST -H "Content-Type: application/json" -d '{
  "rain_data": [
    [2024, 10, 10, 0],
    [2024, 10, 11, 0],
    [2024, 10, 12, 0],
    [2024, 10, 13, 0],
    [2024, 10, 14, 15],
    [2024, 10, 15, 0],
    [2024, 10, 16, 5],
    [2024, 10, 17, 30],
    [2024, 10, 18, 0],
    [2024, 10, 19, 5],
    [2024, 10, 20, 0],
    [2024, 10, 21, 0],
    [2024, 10, 22, 0],
    [2024, 10, 23, 5]
  ]
}' http://127.0.0.1:5000/predict
```
#### Output:
```sh
[
  {
    "date": "2024-10-10",
    "prediction": 0
  },
  {
    "date": "2024-10-11",
    "prediction": 0
  },
  {
    "date": "2024-10-12",
    "prediction": 0
  },
  {
    "date": "2024-10-13",
    "prediction": 0
  },
  {
    "date": "2024-10-14",
    "prediction": 0
  },
  {
    "date": "2024-10-15",
    "prediction": 0
  },
  {
    "date": "2024-10-16",
    "prediction": 0
  },
  {
    "date": "2024-10-17",
    "prediction": 0
  },
  {
    "date": "2024-10-18",
    "prediction": 0
  },
  {
    "date": "2024-10-19",
    "prediction": 0
  },
  {
    "date": "2024-10-20",
    "prediction": 0
  },
  {
    "date": "2024-10-21",
    "prediction": 0
  },
  {
    "date": "2024-10-22",
    "prediction": 0
  },
  {
    "date": "2024-10-23",
    "prediction": 0
  }
]
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- DESCRIPTIONS OF FILES -->
## Descriptions
* [app.py](app.py):
This file is responsible for creating the flask application in which Floodify can communicate to. The applications accepts data in the format of a date and the ammount of rain in millimeters for that day. The first 7 days are presented in this data are past rain data and the last 7 are predicted rain ammounts. Theapplication will then return flood predictions for the predicted rain data days.

* [floodTraining.py](floodTraining.py):
This file is responsible for training the machine learning model used to predict flooding based on historical rainfall data. It reads the data from a CSV file, creates new features for cumulative rainfall over different periods, and splits the data into training and testing sets. The script then trains a RandomForestClassifier model and scales the features using StandardScaler. Finally, the trained model and scaler are saved to disk for later use in the Flask application.

* [DailyHistoricalRain.csv](DailyHistoricalRain.csv):
This file contains historical rainfall data used for training the machine learning model. The dataset includes columns such as `Year`, `Month`, `Day`, and `Rainfall amount (millimetres)`, along with additional columns indicating the severity of flooding (`Minor Flooding`, `Moderate Flooding`, `Major Flooding`). This data is essential for creating features and training the model to predict future flooding events based on past rainfall patterns.

* [flood_prediction_model.pkl](flood_prediction_model.pkl):
This file contains the serialized machine learning model that has been trained to predict flooding based on historical rainfall data. The model, which is a RandomForestClassifier, has been trained on features such as cumulative rainfall over different periods. This file is essential for making predictions in the Flask application, as it allows the application to load the pre-trained model and use it to predict flooding levels based on new input data.

* [scaler.pkl](scaler.pkl):
This file contains the serialized StandardScaler object that has been fitted on the training data. The scaler is used to standardize the input features by removing the mean and scaling to unit variance. This ensures that the input data is processed in the same way during both training and prediction, which is crucial for maintaining the accuracy and reliability of the model. The scaler is loaded in the Flask application to transform the input features before making predictions.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Descriptions
* Joel Beaton (46427481)
* Sam Holt (47055872)
* Selby Mcllroy (46968797)
* Lauren Stacey (46987163)
* Lucy Coleman (45808195)
* James de Raat (46420035)
* Timothy(Ziyang) Xu (47612396)



<p align="right">(<a href="#readme-top">back to top</a>)</p>

















<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 