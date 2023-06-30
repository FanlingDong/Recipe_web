from model import Recipes, User, Like
import datetime
from flask_restx import Namespace, Resource, fields, reqparse
from model import Subscribe
from sqlalchemy import create_engine
from utils.decorate import token_required
from utils import img
from sqlalchemy.orm import sessionmaker
from flask import request
import sys
import json

sys.path.append('..')

engine = create_engine("sqlite:///capstone.db")
Session = sessionmaker(bind=engine)
api = Namespace(
    "subscribe", description="User subscribe contributor or collect recipes part API")

authorizationParser = reqparse.RequestParser()
authorizationParser.add_argument(
    'Authorization', type=str, location='headers', required=True, help='Bearer')


def thisweek():
    monday, sunday = datetime.date.today(), datetime.date.today()
    one_day = datetime.timedelta(days=1)
    while monday.weekday() != 0:
        monday -= one_day
    while sunday.weekday() != 6:
        sunday += one_day
    return monday


subscribepost = api.model('subscribePost', {
    'id': fields.Integer(required=True, default=1)
})

subscribeDelete = api.model('subscribeDelete', {
    'id': fields.Integer(required=True, default=1)
})


@api.route('/contributor')
class SubscribeAction(Resource):
    @api.doc(parser=authorizationParser, body=subscribepost)
    @api.expect(subscribepost)
    @token_required
    def post(self, current_user):
        session = Session()
        # check token
        # check whether this user tries to subscribe itself
        # check whether this user has subscribed this contributor
        try:
            contributorId = json.loads(request.data)['id']
            if contributorId == SubscribeAction.post.id:
                raise Exception('You cannot subscribe yourself!')
            existUser = session.query(session.query(
                User).filter_by(id=contributorId).exists()).scalar()
            if existUser == False:
                raise Exception('No this User')
            existSub = session.query(session.query(Subscribe).filter_by(
                subscriberId=SubscribeAction.post.id, subscribedMan=contributorId).exists()).scalar()
            if existSub == True:
                raise Exception('You have subscribed!')
            theUser = session.query(User).filter_by(id=contributorId).first()
            theUser.followers += 1
            newSubscripe = Subscribe(
                subscriberId=SubscribeAction.post.id, subscribeType='Contributer', subscribedMan=contributorId)
            session.add(newSubscripe)
            session.commit()
            session.close()
            return {'status': 200, 'status': 200}, 200
        except Exception as e:
            return {'msg': str(e), 'status': 400}, 400

    @api.doc(parser=authorizationParser, body=subscribeDelete)
    @api.expect(subscribeDelete)
    @token_required
    def delete(self, current_user):
        # check token
        # check whether this user has subscribed this contributor
        session = Session()
        id = json.loads(request.data)['id']
        try:
            existUser = session.query(session.query(
                User).filter_by(id=id).exists()).scalar()
            if existUser == False:
                raise Exception('No this User')
            existSub = session.query(session.query(Subscribe).filter_by(
                subscriberId=SubscribeAction.delete.id, subscribedMan=id).exists()).scalar()
            if existSub == False:
                raise Exception('You have not subscribed!')
            theSubscribe = session.query(Subscribe).filter_by(
                subscriberId=SubscribeAction.delete.id, subscribedMan=id).first()
            session.delete(theSubscribe)
            theUser = session.query(User).filter_by(id=id).first()
            if theUser.followers >= 1:
                theUser.followers -= 1
            session.commit()
            session.close()
            return {'status': 200}, 200
        except Exception as e:
            return {'msg': str(e)}, 400

    @api.doc(parser=authorizationParser)
    @token_required
    def get(self, current_user):
        # check token
        # find all the contributor this user subscribe
        session = Session()
        try:
            allUser = session.query(Subscribe).filter_by(
                subscriberId=SubscribeAction.get.id, subscribeType='Contributer').all()
            allres = []
            for i in allUser:
                theUser = session.query(User).filter_by(
                    id=i.subscribedMan).first()
                allres.append({
                    'id': theUser.id,
                    'email': theUser.email,
                    'name': theUser.username,
                    'followers': theUser.followers,
                    'avator': img.getimg(theUser.photoPath).decode() if theUser.photoPath else '',
                })
            session.commit()
            session.close()
            return {'subscribes': allres, 'status': 200}, 200
        except Exception as e:
            return {'msg': str(e), 'status': 400}, 400


recipecollectpost = api.model('recipecollectpost', {
    'id': fields.Integer(required=True, default=1)
})

recipecollectdelete = api.model('recipecollectdelete', {
    'id': fields.Integer(required=True, default=1)
})


@api.route('/recipe')
class Collect(Resource):
    @api.doc(parser=authorizationParser, body=recipecollectpost)
    @api.expect(recipecollectpost)
    @token_required
    def post(self, current_user):
        # check token
        # check whether this user has subscribed this recipe
        session = Session()
        try:
            recipeId = json.loads(request.data)['id']
            existRecipe = existLike = session.query(session.query(
                Recipes).filter_by(id=recipeId).exists()).scalar()
            if existRecipe == False:
                raise Exception('No this Recipe')

            existSub = session.query(session.query(Subscribe).filter_by(
                subscriberId=Collect.post.id, subscribedRecipe=recipeId).exists()).scalar()
            if existSub == True:
                raise Exception('You have subscribed!')
            newSubscripe = Subscribe(
                subscriberId=Collect.post.id, subscribeType='Recipe', subscribedRecipe=recipeId)
            session.add(newSubscripe)
            session.commit()
            session.commit()
            session.close()
            return {'status': 200, 'status': 200}, 200
        except Exception as e:
            return {'msg': str(e), 'status': 400}, 400

    @api.doc(parser=authorizationParser, body=recipecollectdelete)
    @api.expect(recipecollectdelete)
    @token_required
    def delete(self, current_user):
        # check token
        # check whether this user has subscribed this recipe
        session = Session()
        id = json.loads(request.data)['id']
        try:
            existRecipe = session.query(session.query(
                Recipes).filter_by(id=id).exists()).scalar()
            if existRecipe == False:
                raise Exception('No this Recipe')
            theSubscribe = session.query(Subscribe).filter_by(
                subscriberId=Collect.delete.id, subscribedRecipe=id).first()
            session.delete(theSubscribe)
            session.commit()
            session.close()
            return {'status': 200, 'status': 200}, 200
        except Exception as e:
            return {'msg': str(e), 'status': 400}, 400

    @api.doc(parser=authorizationParser)
    @token_required
    def get(self, current_user):
        session = Session()
        # check token
        # give all the recipes this user collect
        try:
            allRecipes = session.query(Subscribe).filter_by(
                subscriberId=Collect.get.id, subscribeType='Recipe').all()
            allres = []
            for i in allRecipes:
                current_recipe = session.query(Recipes).filter_by(
                    id=i.subscribedRecipe).first()
                each = session.query(Recipes).filter_by(
                    id=i.subscribedRecipe).first()
                current_user = session.query(User).filter_by(
                    id=current_recipe.contributorId
                ).first()
                result = {
                    "recipe_id": each.id,
                    "name": each.name,
                    "contributorId": each.contributorId,
                    "contributorName": current_user.username,
                    "avatar": img.getimg(current_user.photoPath).decode() if current_user.photoPath else '',
                    "description": each.description if each.description else "",
                    "photoPath": img.getimg(each.photoPath).decode() if each.photoPath else '',
                    "createTime": each.createTime.strftime("%Y-%m-%d"),
                    "likes": each.likes,
                    "like": False
                }
                existLike = session.query(session.query(Like).filter_by(
                    likeMan=Collect.get.id, likeRecipe=each.id).exists()).scalar()
                if existLike:
                    result['like'] = True
                allres.append(result)
            session.close()
            return {'subscribes': allres, 'status': 200}, 200
        except Exception as e:
            return {'msg': str(e), 'status': 400}, 400
