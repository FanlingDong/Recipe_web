from flask_restx import Namespace, Resource, reqparse
from flask import request
import sys

sys.path.append('..')
from sqlalchemy import func
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from model import Subscribe, Recipes, User, Like
import datetime
from utils import img
from utils.decorate import token_check

engine = create_engine("sqlite:///capstone.db")
Session = sessionmaker(bind=engine)
api = Namespace("ranking", description="Get ranking of recipes or contributor by all or week API")

authorizationParser = reqparse.RequestParser()
authorizationParser.add_argument(
    'Authorization', type=str, location='headers', required=True, help='Bearer')


# set a function which can offer the date of this monday
def thisweek():
    monday, sunday = datetime.date.today(), datetime.date.today()
    monday -= datetime.timedelta(days=7)
    return monday


Topget = reqparse.RequestParser()
Topget.add_argument('Date', type=str, default='all', required=True)


@api.route('/top')
class Top(Resource):
    @api.expect(Topget)
    @api.doc(description='date value is all or week')
    @token_check
    def get(self):
        session = Session()
        # check the date is all or week
        Date = request.args['Date']
        TOP5 = {'Recipe': [], 'Contributor': []}
        # count the subscribes, likes by all or this week
        try:
            RspCount = func.count(Like.id).label('RspCount')
            UsrCount = func.count(Subscribe.id).label('UsrCount')
            if Date == 'all':
                Contributor = session.query(Subscribe, UsrCount).filter(
                    Subscribe.subscribeType == 'Contributer').group_by(
                    Subscribe.subscribedMan).order_by(UsrCount.desc()).limit(5).all()
                theRecipes = session.query(Like, RspCount).group_by(
                    Like.likeRecipe).order_by(RspCount.desc()).limit(10).all()
            elif Date == 'week':
                Contributor = session.query(Subscribe, UsrCount).filter(Subscribe.subscribeType == 'Contributer',
                                                                        Subscribe.subDate > thisweek()).group_by(
                    Subscribe.subscribedMan).order_by(UsrCount.desc()).limit(5).all()
                theRecipes = session.query(Like, RspCount).filter(Like.likeDate > thisweek()).group_by(
                    Like.likeRecipe).order_by(RspCount.desc()).limit(10).all()

            for i in theRecipes:
                each = i[0]
                each = session.query(
                    Recipes).filter_by(id=each.likeRecipe).first()
                result = {
                    "recipe_id": each.id,
                    "name": each.name,
                    "contributorId": each.contributorId,
                    "photoPath": img.getimg(each.photoPath).decode() if each.photoPath else '',
                    "createTime": each.createTime.strftime("%Y-%m-%d"),
                    "count": i[1],
                    'like': False
                }
                if Top.get.istoken:
                    existLike = session.query(session.query(Like).filter_by(
                        likeMan=Top.get.id, likeRecipe=each.id).exists()).scalar()
                    if existLike:
                        result['like'] = True
                TOP5['Recipe'].append(result)

            for i in Contributor:
                each = i[0]
                if each.subscribedMan == None:
                    break
                theContributor = session.query(
                    User).filter_by(id=each.subscribedMan).first()
                result = {
                    'id': theContributor.id,
                    'name': theContributor.username,
                    'count': i[1],
                    'photoPath': img.getimg(theContributor.photoPath).decode() if theContributor.photoPath else '',
                    'subscribedMan': False}
                if Top.get.istoken:
                    existSubMan = session.query(session.query(Subscribe).filter_by(
                        subscriberId=Top.get.id, subscribedMan=theContributor.id).exists()).scalar()
                    if existSubMan:
                        result['subscribedMan'] = True
                TOP5['Contributor'].append(result)
            session.close()
            return {'recipes': TOP5['Recipe'], 'contributors': TOP5['Contributor'], 'status': 200}, 200
        except Exception as e:
            return {'msg': str(e), 'status': 400}, 400
