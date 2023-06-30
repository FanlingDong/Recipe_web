from functools import wraps
from flask import request
from model import User


# this decoration must need the token, or bad token
def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization']
            if token.startswith('Bearer'):
                token = token[7:]
            else:
                token = ''
        if not token:
            raise Exception("bad token!")

        try:
            if token:
                current_user = User.verify_auth_token(token)
                if current_user is not None:
                    setattr(decorator, 'id', current_user)
                    setattr(decorator, 'istoken', True)
                else:
                    raise Exception("bad token!")
        except Exception as e:
            raise Exception("bad token!")

        return f(current_user, *args, **kwargs)

    return decorator


# this decoration will check token, if token, the result will be a little different
def token_check(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        setattr(decorator, 'istoken', False)
        if 'Authorization' in request.headers:
            token = request.headers['Authorization']
            if token.startswith('Bearer'):
                token = token[7:]
            else:
                token = ''

        try:
            if token:
                current_user = User.verify_auth_token(token)
                if current_user is not None:
                    setattr(decorator, 'id', current_user)
                    setattr(decorator, 'istoken', True)
                else:
                    raise Exception("bad token!")
        except Exception as e:
            raise Exception("bad token!")

        return f(*args, **kwargs)

    return decorator
