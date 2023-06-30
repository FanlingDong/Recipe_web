import sys
import json

sys.path.append('..')
from flask_restx import Namespace, Resource, fields, reqparse
from flask import request
from sqlalchemy.orm import sessionmaker
from utils.decorate import token_required
from sqlalchemy import create_engine
from model import Comment, User
from sqlalchemy_pagination import paginate

engine = create_engine("sqlite:///capstone.db?check_same_thread=False")
Session = sessionmaker(bind=engine)
api = Namespace("comment", description="User comment part API")

authorizationParser = reqparse.RequestParser()
authorizationParser.add_argument(
    'Authorization', type=str, location='headers', required=True, help='Bearer')

commentpost = api.model('comment', {
    'content': fields.String(required=True, default="comment"),
}, )

commentGet = reqparse.RequestParser()
commentGet.add_argument('page', type=int)
commentGet.add_argument('size', type=int)


@api.route('/<int:recipeId>')
class CommentContent(Resource):
    @api.doc(parser=authorizationParser, body=commentpost)
    @api.expect(commentpost)
    @token_required
    def post(self, current_user, recipeId):
        # check token and add comment to database
        session = Session()
        totalData = json.loads(request.data)
        content = totalData['content']
        newComment = Comment(commentUser=CommentContent.post.id, isReply=False, content=content, likes=0,
                             repliedRecipe=recipeId)
        session.add(newComment)
        session.commit()
        session.close()
        return {'msg': 'OK!', 'status': 200}, 200

    @api.expect(commentGet)
    def get(self, recipeId):
        # get the comment of recipe which offer the page and size
        session = Session()
        page = int(request.args['page'])
        size = int(request.args['size'])
        page = paginate(session.query(Comment).filter_by(repliedRecipe=recipeId).order_by(Comment.commentDate.desc()),
                        page, size)

        res = []
        for i in page.items:
            username = session.query(User).filter_by(id=i.commentUser).first().username
            res.append({'id': i.id, 'commentUser': username, 'content': i.content})
        session.close()
        return {'PageComment': res, 'status': 200}, 200
