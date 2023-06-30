from flask_restx import Api
from .User import api as user_api
from .Recipe import api as recipe_api
from .Like import api as like_api
from .Comment import api as comment_api
from .Subscribe import api as subscribe_api
from .ranking import api as ranking_api

# flask_restx module provides Swagger
api = Api(title="Capstone API", version="1.0", description="Capstone API", )

# import all the api and init them
api.add_namespace(user_api)
api.add_namespace(recipe_api)
api.add_namespace(like_api)
api.add_namespace(comment_api)
api.add_namespace(subscribe_api)
api.add_namespace(ranking_api)
