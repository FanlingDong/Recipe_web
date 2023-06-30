from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
from capstone_api import api

app = Flask(__name__)
# Set the app files saving path
app.config['uploadUser'] = './uploadFolder/user'
app.config['uploadRecipe'] = './uploadFolder/recipe'
app.config['SECRET_KEY'] = "kbt"

# cors setting
cors = CORS(app, supports_credentials=True)
app.wsgi_app = ProxyFix(app.wsgi_app)

api.init_app(app)

app.run(debug=True)
