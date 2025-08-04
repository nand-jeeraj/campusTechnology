from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

mongo = PyMongo()
bcrypt = Bcrypt()
jwt = JWTManager()
cors = CORS()