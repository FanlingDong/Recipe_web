# Introduction

This is a Meal Recommendation System developped by COMP9900-T16Q-Vite.

Here is a **readme** file, please read it carefully to understand how to launch this system.

We have made a comprehensive test on **CSE vlab** machines, anything runs well!

There are **two methods** to launch this system, the **first one** is to use a URL to explorer the system that we have deployed on AWS cloud (which is really easy, but maybe slow), the **second one** is to use local (which is fast, but you should setup the environment). The systems on AWS cloud and local are totally same.



# Use AWS cloud

This system has been deployed on AWS cloud, you can explorer it by:

1. Open a web browser (Chrome, Safari, Firefox).
2. Copy the link http://3.26.64.9:5001 and paste it on your browser, then you can explorer this system.



# Use local

You can also use local to explorer this system. Please read the following instructions to understand how to launch this sytem at local.

Firstly, you should clone the repository from **main** branch to your local or directly download the zip file.

#### Backend confirguration and start

The backend of this system was developped by Python3 and Flask, so please make sure your computer has installed Python3 with relative late version (such as Python3.8 or Python3.9, you can download from https://www.python.org/).

Then do the following steps:

1. Open a terminal at the project directory.
2. Switch to the backend directory by using the command line `cd backend`.
3. Then activate the virtual environment by using the command line `source venv/bin/activate`.
4. In the virtual environment, you should install some Python packages, you should run the command line `pip3 install -r requirements.txt` to install the packages, you may should wait it for several minutes.
5. After installation, use the command line `python3 capstoneapp.py` to launch the backend. If you get an error at this step, just read the error information, you must lack some packages and you should install them by `pip3 install [package name]`.
6. Once the backend has started, you can view the API documentation by navigating to the base URL (e.g. http://127.0.0.1:5000) in a web browser if you want.



#### Frontend confirguration and start

The frontend of this system was developped by JavaScript and ReactJS, so please make sure your computer has installed NodeJS and NPM with relative late version (such as the latest NodeJS version https://nodejs.org/en/, remember the NPM will be automatically included in the NodeJS Installer).

Then do the following steps:

1. Open a terminal at the project directory.
2. Switch to the frontend directory by using the command line `cd frontend`.
3. Run command line `rm -rf node_modules` to delete all the existed **node_modules** packages.
4. Run command line `npm cache clear --force` to clear the npm cache.
5. Then use the command line `npm install` to install the necessary **node_modules** packages. If you meet a problem while installing, just firstly run the command line `npm config set legacy-peer-deps true`, then run `npm install`, you maybe need to wait a moment.
6. After installation, you can start the frontend by `npm start`.
7. Once the frontend has started, you can view the frontend of this system by navigating to the base URL (e.g. http://localhost:3000) in a web browser.
8. Now you can explorer this system, enjoy!
