"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Task, Blacklist
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.utils import bcrypt
from flask_jwt_extended import create_access_token, get_jwt, jwt_required

api = Blueprint('api', __name__)


# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No se recibieron datos"}),400
    
    if 'email' not in data or 'password' not in data or 'username' not in data:
        return jsonify({"error": "Faltan datos requeridos para registrar el usuario"}), 400

    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El correo utilizado ya se encuntra registrado"}), 409
    
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "El nombre de usuario se encuentra en uso"}), 409
    
    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    user = User(
        email=email,
        username=username,
        password=pw_hash
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Usuario registrado"}), 200

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if 'email' not in data or 'password' not in data:
        return jsonify({"error":"Faltan credenciales para poder autenticarse"}), 400
    
    email = data.get('email')
    password = data.get('password')

    usuario = User.query.filter_by(email=email).first()

    if not usuario or not bcrypt.check_password_hash(usuario.password, password):
        return jsonify({"error":"Credenciales incorrectas"}), 401
    
    access_token = create_access_token(identity=usuario.username)

    return jsonify({"user": usuario.serialize(), "acces_token": access_token}), 200

@api.route("/logout", methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    
    token = Blacklist(jti=jti)
    db.session.add(token)
    db.session.commit()
    return jsonify({"message":"Session cerrada"}), 200