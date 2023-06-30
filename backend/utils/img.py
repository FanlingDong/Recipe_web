from flask import current_app as app
import os
import base64
from uuid import uuid4


# upload the img file to the certain path
def img_upload(imgbase64, storePosition):
    decoded = base64.b64decode(imgbase64)
    MEDIA = app.config[storePosition]
    filename = str(uuid4()) + '.png'
    img_path = os.path.join(MEDIA, filename)
    with open(img_path, 'wb') as fh:
        fh.write(decoded)
    return img_path


# get the img file from the certain path
def getimg(filename):
    with open(filename, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return encoded_string


# after replace images, delete replaced image
def del_files(dir_path):
    if os.path.isfile(dir_path):
        try:
            os.remove(dir_path)
        except BaseException as e:
            print(e)
    elif os.path.isdir(dir_path):
        file_lis = os.listdir(dir_path)
        for file_name in file_lis:
            tf = os.path.join(dir_path, file_name)
            del_files(tf)
