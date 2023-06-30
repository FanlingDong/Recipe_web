from flask_restx import Namespace, Resource, fields, reqparse
from backend.model.SubscribeModel import Subscribe
from model import Recipes, User, Like
from sqlalchemy import create_engine
from utils.decorate import token_required, token_check
from utils import img
from sqlalchemy.orm import sessionmaker
from flask import request
import sys
import json
from sqlalchemy.sql import and_
from sqlalchemy.sql import or_

sys.path.append('..')
from datetime import datetime

engine = create_engine("sqlite:///capstone.db", echo=True)
Session = sessionmaker(bind=engine, expire_on_commit=False)
api = Namespace("recipes", description="recipes part API")

authorizationParser = reqparse.RequestParser()
authorizationParser.add_argument(
    'Authorization', type=str, location='headers', required=True, help='Bearer')

authorizationCheck = reqparse.RequestParser()
authorizationCheck.add_argument(
    'Authorization', type=str, location='headers', help='Bearer')

recipepost = api.model('recipePost', {
    'name': fields.String(required=True, default="recipe"),
    'method': fields.String(required=True, default="baking"),
    'mealType': fields.String(required=True, default="breakfast"),
    'ingredients': fields.String(required=True, default="{'pears': 4, 'flour': '200g', 'lemon': 1, 'butter': '200g'}"),
    'steps': fields.String(required=True,
                           default="[{'picture': '', 'description': 'At the end of the baking time, remove the cake from the oven and let it cool slightly before removing it from the tin.'}]"),
    'description': fields.String(required=False,
                                 default="The best and quickest pear cake in the world. Just like grandma's apple pie, it takes you right back to your childhood."),
    'photo': fields.String(required=False, default="")
})


# give the recipes created by this user
# check token
@api.route('/myrecipes')
class MyRecipes(Resource):
    @api.doc(parser=authorizationParser)
    @token_required
    def get(self, current_user):
        my_recipes = []
        session = Session()
        recipes = session.query(Recipes).filter_by(
            contributorId=MyRecipes.get.id, isActive=True).all()
        current_user = session.query(User).filter_by(
            id=MyRecipes.get.id).first()
        session.close()
        for each in recipes:
            result = {
                "id": each.id,
                "name": each.name,
                "method": each.method,
                "mealType": each.mealType,
                "ingredients": each.ingredients,
                "contributorId": each.contributorId,
                "contributorName": current_user.username,
                "description": each.description if each.description else "",
                "photoPath": img.getimg(each.photoPath).decode() if each.photoPath else '',
                "createTime": each.createTime.strftime("%Y-%m-%d"),
                "likes": each.likes
            }
            my_recipes.append(result)
        return {"recipes": my_recipes, "status": 200}, 200


# create recipe
# need token
@api.route('/create')
class postRecipe(Resource):
    @api.doc(parser=authorizationParser, body=recipepost)
    @api.expect(recipepost)
    @token_required
    def post(self, current_user):
        session = Session()
        current_user = session.query(User).filter_by(
            id=postRecipe.post.id).first()
        request_data = request.get_json()
        # must set createTime, or the dynamic will be wrong
        try:
            new_recipe = Recipes(
                name=request_data['name'],
                method=request_data['method'],
                mealType=request_data['mealType'],
                ingredients=request_data['ingredients'],
                steps=request_data['steps'],
                contributorId=postRecipe.post.id,
                description=request_data['description'] if request_data['description'] else "",
                photoPath=img.img_upload(
                    request_data['photo'], "uploadRecipe") if request_data['photo'] else '',
                isActive=True,
                createTime=datetime.now()
            )
            session.add(new_recipe)
            session.commit()
            session.close()
        except Exception as e:
            return {"message": "An error occurred creating the recipe.", "status": 500}, 500
        return {"new_recipe_id": new_recipe.id, "status": 200}, 200


# view my recipe detail
# which can also be changed
@api.route('/myrecipes/<int:recipe_id>')
class get_recipe_details(Resource):
    @api.doc(parser=authorizationParser)
    @token_required
    def get(self, current_user, recipe_id):
        session = Session()
        recipe = session.query(Recipes).filter_by(
            id=recipe_id, isActive=True).first()
        current_user = session.query(User).filter_by(
            id=get_recipe_details.get.id).first()
        session.close()
        if recipe:
            result = {
                "id": recipe.id,
                "name": recipe.name,
                "method": recipe.method,
                "mealType": recipe.mealType,
                "ingredients": recipe.ingredients,
                "steps": recipe.steps,
                "contributorId": recipe.contributorId,
                "contributorName": current_user.username,
                "avatar": img.getimg(current_user.photoPath).decode() if current_user.photoPath else '',
                "description": recipe.description if recipe.description else "",
                "photoPath": img.getimg(recipe.photoPath).decode() if recipe.photoPath else '',
                "createTime": recipe.createTime.strftime("%Y-%m-%d"),
                "likes": recipe.likes,
                "like": False,
                "subscribed": False,
                "subscribedMan": False,
            }
            existLike = session.query(session.query(Like).filter_by(
                likeMan=get_recipe_details.get.id, likeRecipe=recipe.id).exists()).scalar()
            if existLike:
                result['like'] = True
            existSub = session.query(session.query(Subscribe).filter_by(
                subscriberId=get_recipe_details.get.id, subscribedRecipe=recipe.id).exists()).scalar()
            if existSub:
                result['subscribed'] = True
            existSubMan = session.query(session.query(Subscribe).filter_by(
                subscriberId=get_recipe_details.get.id, subscribedMan=recipe.contributorId).exists()).scalar()
            if existSubMan:
                result['subscribedMan'] = True
            return {"recipe": result, "status": 200}, 200
        else:
            return {"message": "recipe not found", "status": 404}, 404

    @api.doc(parser=authorizationParser, body=recipepost)
    @api.expect(recipepost)
    @token_required
    def put(self, current_user, recipe_id):
        session = Session()
        recipe = session.query(Recipes).filter_by(
            id=recipe_id, isActive=True).first()
        request_data = request.get_json()
        if recipe:
            if request_data['name']:
                recipe.name = request_data['name']
            if request_data['method']:
                recipe.method = request_data['method']
            if request_data['mealType']:
                recipe.mealType = request_data['mealType']
            if request_data['ingredients']:
                recipe.ingredients = request_data['ingredients']
            if request_data['steps']:
                recipe.steps = request_data['steps']
            if request_data['description']:
                recipe.description = request_data['description']
            if request_data['photo']:
                oldfilePath = recipe.photoPath
                if oldfilePath != '' and oldfilePath != None:
                    img.del_files(oldfilePath)
                recipe.photoPath = img.img_upload(
                    request_data['photo'], "uploadRecipe")
            try:
                session.commit()
                session.close()
            except:
                return {"message": "An error occurred updating the recipe.", "status": 500}, 500
            return {"message": "recipe updated", "status": 200}, 200
        else:
            return {"message": "recipe not found", "status": 404}, 404

    @api.doc(parser=authorizationParser)
    @token_required
    def delete(self, current_user, recipe_id):
        session = Session()
        recipe = session.query(Recipes).filter_by(
            id=recipe_id).first()  # , isActive=True
        if recipe:
            try:
                recipe.isActive = False
                session.query(Like).filter_by(likeRecipe=recipe.id).delete()
                session.query(Subscribe).filter_by(subscribedRecipe=recipe.id).delete()
                session.add(recipe)
                session.commit()
                session.close()
            except:
                return {"message": "An error occurred deleting the recipe.", "status": 500}, 500
            return {"message": "recipe deleted", "status": 200}, 200
        else:
            return {"message": "recipe not found", "status": 404}, 404


pubulishedRecipesQuery = reqparse.RequestParser()
pubulishedRecipesQuery.add_argument(
    'page', type=int, required=True)
pubulishedRecipesQuery.add_argument(
    'size', type=int, required=True)


# give all the published recipes
# can be paginated
@api.route('/published_recipes')
class Published_recipes(Resource):
    @api.doc(parser=authorizationCheck, body=pubulishedRecipesQuery)
    @token_check
    def get(self):
        session = Session()
        page = int(request.args['page'])
        size = int(request.args['size'])
        offset = (page - 1) * size
        published_recipes = []
        recipes = session.query(Recipes).filter_by(
            isActive=True).limit(size).offset(offset).all()
        totalNum = session.query(Recipes).filter_by(
            isActive=True).count()
        for each in recipes:
            try:
                current_user = session.query(User).filter_by(
                    id=each.contributorId).first()
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
                    "like": False,
                    "subscribed": False
                }
                if Published_recipes.get.istoken:
                    existLike = session.query(session.query(Like).filter_by(
                        likeMan=Published_recipes.get.id, likeRecipe=each.id).exists()).scalar()
                    if existLike:
                        result['like'] = True
                    existSub = session.query(session.query(Subscribe).filter_by(
                        subscriberId=Published_recipes.get.id, subscribedRecipe=each.id).exists()).scalar()
                    if existSub:
                        result['subscribed'] = True
                published_recipes.append(result)
            except Exception as e:
                print(e)
                pass
        return {"recipes": published_recipes, 'total': totalNum, "status": 200}, 200


# check the token and if token, there will be diffrent result
@api.route('/published_recipes/<int:recipe_id>')
class published_recipe_details(Resource):
    @api.doc(parser=authorizationCheck)
    @token_check
    def get(self, recipe_id):
        session = Session()
        recipe = session.query(Recipes).filter_by(
            id=recipe_id, isActive=True).first()
        if recipe:
            current_user = session.query(User).filter_by(
                id=recipe.contributorId).first()
            result = {
                "id": recipe.id,
                "name": recipe.name,
                "method": recipe.method,
                "mealType": recipe.mealType,
                "ingredients": recipe.ingredients,
                "steps": recipe.steps,
                "contributorId": recipe.contributorId,
                "contributorName": current_user.username,
                "avatar": img.getimg(current_user.photoPath).decode() if current_user.photoPath else '',
                "description": recipe.description if recipe.description else "",
                "photoPath": img.getimg(recipe.photoPath).decode() if recipe.photoPath else '',
                "createTime": recipe.createTime.strftime("%Y-%m-%d"),
                "likes": recipe.likes,
                "like": False,
                "subscribed": False,
                "subscribedMan": False
            }
            if published_recipe_details.get.istoken:
                existLike = session.query(session.query(Like).filter_by(
                    likeMan=published_recipe_details.get.id, likeRecipe=recipe.id).exists()).scalar()
                if existLike:
                    result['like'] = True
                existSub = session.query(session.query(Subscribe).filter_by(
                    subscriberId=published_recipe_details.get.id, subscribedRecipe=recipe.id).exists()).scalar()
                if existSub:
                    result['subscribed'] = True
                existSubMan = session.query(session.query(Subscribe).filter_by(
                    subscriberId=published_recipe_details.get.id, subscribedMan=recipe.contributorId).exists()).scalar()
                if existSubMan:
                    result['subscribedMan'] = True
            session.close()
            return {"recipe": result, "status": 200}, 200
        else:
            return {"message": "recipe not found", "status": 404}, 404


# check the token and if token, there will be diffrent result
@api.route('/published_recipes/<int:recipe_id>/recommendation')
class published_recipe_recommendation(Resource):
    @api.doc(parser=authorizationCheck)
    @token_check
    def get(self, recipe_id):
        session = Session()
        target_recipe = session.query(Recipes).filter_by(
            id=recipe_id, isActive=True).first()
        if target_recipe:
            target_ingredients = []
            try:
                if target_recipe:
                    for ingredient in json.loads(target_recipe.ingredients):
                        lowercase_ingredient = ingredient["ingredient"].lower()
                        split_ingred = lowercase_ingredient.split(" ")
                        target_ingredients.extend(split_ingred)
                target_list = []
                target_list = [getattr(Recipes, "ingredients").contains(x)
                               for x in target_ingredients]
                page = session.query(Recipes).filter(
                    or_(
                        *target_list
                    ),
                    and_(Recipes.id != recipe_id, Recipes.isActive == True)
                ).limit(6).all()
                recommend_Recipes = []
                recipe_idlist = []
                for each in page:
                    current_user = session.query(User).filter_by(
                        id=each.contributorId).first()
                    result = {
                        "recipe_id": each.id,
                        "name": each.name,
                        "ingredients": each.ingredients,
                        "contributorId": each.contributorId,
                        "contributorName": current_user.username,
                        "description": each.description if each.description else "",
                        "photoPath": img.getimg(each.photoPath).decode() if each.photoPath else '',
                        "createTime": each.createTime.strftime("%Y-%m-%d"),
                        "likes": each.likes,
                        "like": False
                    }
                    if published_recipe_recommendation.get.istoken:
                        existLike = session.query(session.query(Like).filter_by(
                            likeMan=published_recipe_recommendation.get.id, likeRecipe=each.id).exists()).scalar()
                        if existLike:
                            result['like'] = True
                    recipe_idlist.append(each.id)
                    recommend_Recipes.append(result)
                if len(recommend_Recipes) < 6:
                    supplement_page = []
                    supplement_page = session.query(Recipes).filter(
                        and_(Recipes.id != recipe_id, Recipes.isActive == True)).order_by(
                        Recipes.likes.desc()).limit(11).all()
                    for each in supplement_page:
                        if len(recommend_Recipes) < 6 and each.id not in recipe_idlist:
                            current_user = session.query(User).filter_by(
                                id=each.contributorId).first()
                            result = {
                                "recipe_id": each.id,
                                "name": each.name,
                                "ingredients": each.ingredients,
                                "contributorId": each.contributorId,
                                "contributorName": current_user.username,
                                "description": each.description if each.description else "",
                                "photoPath": img.getimg(each.photoPath).decode() if each.photoPath else '',
                                "createTime": each.createTime.strftime("%Y-%m-%d"),
                                "likes": each.likes,
                                "like": False
                            }
                            if published_recipe_recommendation.get.istoken:
                                existLike = session.query(session.query(Like).filter_by(
                                    likeMan=published_recipe_recommendation.get.id,
                                    likeRecipe=each.id).exists()).scalar()
                                if existLike:
                                    result['like'] = True
                            recommend_Recipes.append(result)
                session.close()
            except Exception as e:
                print(e)
                return {"message": "recommendation error", "status": 500}, 500
        else:
            return {"message": "recipe not found", "status": 404}, 404
        return {"recipes": recommend_Recipes, "status": 200}, 200


searchGet = reqparse.RequestParser()
searchGet.add_argument('name', type=str)
searchGet.add_argument('method', type=str)
searchGet.add_argument('ingredients', type=str)
searchGet.add_argument('mealType', type=str)


@api.route('/search')
class search_Recipe(Resource):
    @api.expect(searchGet)
    @token_check
    def get(self):
        session = Session()
        # according to the key value of the query to search
        keys = dict(request.args)
        filter_list1 = [Recipes.isActive != False]
        filter_list = [getattr(Recipes, key).contains(value)
                       for key, value in keys.items()]
        filter_list.extend(filter_list1)
        page = session.query(Recipes).filter(
            and_(
                *filter_list
            )
        ).order_by(Recipes.likes.desc()).all()
        totalnumber = session.query(Recipes).filter(
            and_(
                *filter_list
            )
        ).count()
        searchRecipes = []
        for each in page:
            current_user = session.query(User).filter_by(
                id=each.contributorId).first()
            result = {
                "recipe_id": each.id,
                "name": each.name,
                "contributorId": each.contributorId,
                "contributorName": current_user.username,
                "avatar": img.getimg(current_user.photoPath).decode() if current_user.photoPath else '',
                "photoPath": img.getimg(each.photoPath).decode() if each.photoPath else '',
                "createTime": each.createTime.strftime("%Y-%m-%d"),
                "likes": each.likes,
                "like": False
            }
            if search_Recipe.get.istoken:
                existLike = session.query(session.query(Like).filter_by(
                    likeMan=search_Recipe.get.id, likeRecipe=each.id).exists()).scalar()
                if existLike:
                    result['like'] = True
            searchRecipes.append(result)
        return {"recipes": searchRecipes, 'total': totalnumber, "status": 200}, 200
