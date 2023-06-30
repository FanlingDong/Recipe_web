import sys

sys.path.append('..')
from flask_restx import Namespace, Resource, reqparse
from sqlalchemy.orm import sessionmaker
from utils.decorate import token_required
from sqlalchemy import create_engine
from model import Recipes, Like

engine = create_engine("sqlite:///capstone.db?check_same_thread=False")
Session = sessionmaker(bind=engine)
api = Namespace("like", description="like part API")

authorizationParser = reqparse.RequestParser()
authorizationParser.add_argument(
    'Authorization', type=str, location='headers', required=True, help='Bearer')


@api.route('/<int:recipe_id>')
class LikeP(Resource):
    @api.doc(parser=authorizationParser)
    @token_required
    def post(self, current_user, recipe_id):
        # check token
        # check whether this user has liked it
        # if so unlike or like
        session = Session()
        try:
            recipe = session.query(Recipes).filter_by(id=recipe_id).first()
            existLike = session.query(
                session.query(Like).filter_by(likeMan=LikeP.post.id, likeRecipe=recipe_id).exists()).scalar()
            if existLike:
                theLike = session.query(Like).filter_by(likeMan=LikeP.post.id, likeRecipe=recipe_id).first()
                session.delete(theLike)
                recipe.likes -= 1
                session.commit()
                session.close()
                return {'msg': 'Cancel like successfully!', 'status': 200}
            else:
                newlike = Like(likeMan=LikeP.post.id, likeType="Recipe", likeRecipe=recipe_id)
                session.add(newlike)
                recipe.likes += 1
                session.commit()
                session.close()
                return {'msg': 'Like successfully!', 'status': 200}
        except Exception as e:
            return {'msg': 'Does not exist this recipe!', 'status': 404}, 404
