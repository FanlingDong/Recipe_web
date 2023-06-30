from model import User, Subscribe, Recipes, Like
from sqlalchemy import create_engine
from flask_restx import Namespace, Resource, fields, reqparse
import datetime as dt
from datetime import datetime
from utils.decorate import token_required
from utils import img
from sqlalchemy.orm import sessionmaker
from flask import request
import sys
import json

sys.path.append('..')

engine = create_engine("sqlite:///capstone.db?check_same_thread=False")
Session = sessionmaker(bind=engine)
api = Namespace(
    "user", description="User register,login,change password part API")

loginpost = api.model('Login', {
    'email': fields.String(required=True, default="test@unsw.edu.au"),
    'password': fields.String(required=True, default="123456")
})

loginresult = api.model('loginresult', {
    'token': fields.String(required=True),
})

loginWrong = api.model('loginWrong', {
    'msg': fields.String(required=True, default='Wrong Pasword!'),
})


# Login part
@api.route('/login')
class Login(Resource):
    @api.expect(loginpost)
    @api.doc(body=loginpost)
    @api.response(400, 'User account or password wrong!')
    @api.response(200, 'return token')
    def post(self):
        session = Session()
        # read the email and password and find whether in database
        email = json.loads(request.data)['email']
        password = json.loads(request.data)['password']
        try:
            theUser = session.query(User).filter_by(
                email=email, password=password).first()
            access_token = theUser.generate_auth_token()
            session.close()
            return {'token': access_token.decode('ascii'), 'status': 200}, 200
        except Exception as e:
            return {'msg': 'Wrong Pasword!', 'status': 400}, 400


registerpost2 = api.model('Register', {
    'email': fields.String(required=True, default="test@unsw.edu.au"),
    'username': fields.String(required=True, default="Username"),
    'password': fields.String(required=True, default="123456"),
}, )

registerResult = api.model('register', {
    'token': fields.String(required=True),
})

registerWrong = api.model('registernWrong', {
    'msg': fields.String(required=True, default='Wrong Register Information!'),
})


# register part
@api.route('/register')
class Register(Resource):
    @api.expect(registerpost2)
    @api.response(400, 'Wrong parameters')
    @api.doc(model=registerpost2)
    def post(self):
        session = Session()
        try:
            # read all the data and add a new user in database
            totalData = json.loads(request.data)
            password = json.loads(request.data)['password']
            newUser = User(**totalData)
            newUser.lastViewDate = datetime.now()
            session.add(newUser)
            session.commit()
            newUser.hash_password(password)
            access_token = newUser.generate_auth_token()
            session.close()
            return {'token': access_token.decode('ascii'), 'status': 200}, 200
        except Exception as e:
            print(e)
            return {'msg': 'Wrong Register Information!', 'status': 400}, 400


changePassput = api.model('changePass', {
    'email': fields.String(required=True, default="test@unsw.edu.au"),
    'oldPassword': fields.String(required=True, default="123456"),
    'newPassword': fields.String(required=True, default="1234567")
})

changePassresult = api.model('changePassResult', {
    'token': fields.String(required=True),
})


# change password
@api.route('/changePass')
class ChangePass(Resource):
    @api.expect(changePassput)
    @api.response(400, 'Wrong parameters!')
    def put(self):
        session = Session()
        # verify email and password and change password
        email = json.loads(request.data)['email']
        oldpassword = json.loads(request.data)['oldPassword']
        try:
            theUser = session.query(User).filter_by(
                email=email, password=oldpassword).first()
            newpassword = json.loads(request.data)['newPassword']
            theUser.password = newpassword
            theUser.hash_password(newpassword)
            access_token = theUser.generate_auth_token()
            session.commit()
            session.close()
            return {'token': access_token.decode('ascii'), 'status': 200}, 200
        except Exception as e:
            return {'msg': 'Wrong Pasword!', 'status': 400}, 400


profileput = api.model('Profile', {
    'username': fields.String(required=True, default="Username"),
    'photo': fields.String(required=True, default=""),
    'selfDescription': fields.String(required=True, default="selfDescription"),
}, )
authorizationParser = reqparse.RequestParser()
authorizationParser.add_argument(
    'Authorization', type=str, location='headers', required=True, help='Bearer')


# get and change the profile
# need token
@api.route('/profile')
class Profile(Resource):
    @api.doc(parser=authorizationParser, body=profileput)
    @api.expect(profileput)
    @token_required
    def put(self, current_user):
        session = Session()
        current_user = session.query(User).filter_by(id=Profile.put.id).first()
        try:
            # get the current info and change them
            username = json.loads(request.data)['username']
            photo = json.loads(request.data)['photo']
            selfDescription = json.loads(request.data)['selfDescription']
            if username != '':
                current_user.username = username
            current_user.selfDescription = selfDescription
            if photo != '':
                oldfilename = current_user.photoPath
                filename = img.img_upload(photo, 'uploadUser')
                current_user.photoPath = filename
                if oldfilename != '' and oldfilename != None:
                    img.del_files(oldfilename)
            session.commit()
            session.close()
            return {'status': 200}, 200
        except Exception as e:
            return {'msg': 'Wrong Content or Token!', 'status': 400}, 400

    @api.doc(parser=authorizationParser)
    @token_required
    def get(self, current_user):
        try:
            # get the info of this user
            session = Session()
            current_user = session.query(User).filter_by(
                id=Profile.get.id).first()
            session.close()
            return {'email': current_user.email,
                    'username': current_user.username,
                    'selfDescription': current_user.selfDescription if current_user.selfDescription != None else '',
                    'photo': img.getimg(current_user.photoPath).decode() if current_user.photoPath else '',
                    'status': 200}, 200
        except Exception as e:
            return {'msg': 'Wrong Content or Token!', 'status': 400}, 400


# get the dynamic of the user
# need token
@api.route('/dynamic')
class Dynamic(Resource):
    @api.doc(parser=authorizationParser)
    @token_required
    def get(self, current_user):
        try:
            session = Session()
            # check the user and find all the recipes that create time
            # are later than last view time and its contributor is subscirbed by this user
            current_user = session.query(User).filter_by(
                id=Dynamic.get.id).first()
            lastDate = current_user.lastViewDate
            if lastDate == None:
                current_user.lastViewDate = datetime.now()
                lastDate = datetime.now()
            NewRecipes = session.query(Recipes). \
                join(Subscribe, Subscribe.subscribedMan == Recipes.contributorId). \
                filter(Recipes.createTime >= Subscribe.subDate, Subscribe.subscriberId == Dynamic.get.id,
                       Recipes.isActive != False). \
                order_by(Recipes.id.desc()).limit(20).all()
            published_recipes = []
            totalNum = len(NewRecipes)
            for each in NewRecipes:
                print(each.contributorId)
                Contributor = session.query(User).filter_by(
                    id=each.contributorId).first()
                result = {
                    "recipe_id": each.id,
                    "name": each.name,
                    "contributorId": each.contributorId,
                    "contributorName": Contributor.username,
                    "avatar": img.getimg(Contributor.photoPath).decode() if Contributor.photoPath else '',
                    "description": each.description if each.description else "",
                    "photoPath": img.getimg(each.photoPath).decode() if each.photoPath else '',
                    "createTime": each.createTime.strftime("%Y-%m-%d"),
                    "likes": each.likes,
                    "like": False,
                    "subscribed": False,
                    "new": False
                }
                existLike = session.query(session.query(Like).filter_by(
                    likeMan=Dynamic.get.id, likeRecipe=each.id).exists()).scalar()
                if existLike:
                    result['like'] = True
                existSub = session.query(session.query(Subscribe).filter_by(
                    subscriberId=Dynamic.get.id, subscribedRecipe=each.id).exists()).scalar()
                if existSub:
                    result['subscribed'] = True
                if each.createTime > lastDate:
                    result['new'] = True
                published_recipes.append(result)
            current_user.lastViewDate = datetime.now() - dt.timedelta(seconds=30)
            print(current_user.lastViewDate)
            session.commit()
            session.close()
            return {"recipes": published_recipes, 'total': totalNum, "status": 200}, 200
        except Exception as e:
            print(e)
            return {'msg': 'Wrong Content or Token!', 'status': 400}, 400


# check whether there is a dynamic existing
@api.route('/isdynamic')
class DynamicNew(Resource):
    @api.doc(parser=authorizationParser)
    @token_required
    def get(self, current_user):
        try:
            # check the user and find all the recipes that create time
            # are later than last view time and its contributor is subscirbed by this user
            session = Session()
            current_user = session.query(User).filter_by(
                id=DynamicNew.get.id).first()
            lastDate = current_user.lastViewDate
            if lastDate == None:
                current_user.lastViewDate = datetime.now()
                lastDate = datetime.now()
            totalNum = session.query(Recipes). \
                join(Subscribe, Subscribe.subscribedMan == Recipes.contributorId). \
                filter(Recipes.createTime >= Subscribe.subDate, Recipes.createTime >=
                       lastDate, Subscribe.subscriberId == DynamicNew.get.id).count()
            session.commit()
            session.close()
            return {"new": True if totalNum > 0 else False, "status": 200}, 200
        except Exception as e:
            print(e)
            return {'msg': 'Wrong Content or Token!', 'status': 400}, 400
