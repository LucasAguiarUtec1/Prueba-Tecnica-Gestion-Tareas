"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Task, Blacklist
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.utils import bcrypt
from flask_jwt_extended import create_access_token, get_jwt, jwt_required
from sqlalchemy.orm import Bundle
from sqlalchemy import select, update

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
    
    if not data or 'email' not in data or 'password' not in data or 'username' not in data:
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
        email=email, # type: ignore
        username=username, # type: ignore
        password=pw_hash # type: ignore
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Usuario registrado"}), 200

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error":"Faltan credenciales para poder autenticarse"}), 400
    
    email = data.get('email')
    password = data.get('password')

    usuario = User.query.filter_by(email=email).first()

    if not usuario or not bcrypt.check_password_hash(usuario.password, password):
        return jsonify({"error":"Credenciales incorrectas"}), 401
    
    access_token = create_access_token(identity=usuario.username)

    return jsonify({"user": usuario.serialize(), "acces_token": access_token}), 200

@api.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    
    token = Blacklist(jti=jti) # type: ignore
    db.session.add(token)
    db.session.commit()
    return jsonify({"message":"Session cerrada"}), 200

@api.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    data = request.get_json()

    if not data or 'email' not in data or 'label' not in data:
        return jsonify({"error": "Faltan datos requeridos para crear la tarea. Verifique que se hayan proporcionado todos los campos obligatorios"})
    
    email = data.get("email")

    row = db.session.execute(
        select(User.id).where(User.email==email)
    ).first()

    user_id = row[0] if row else None

    if not user_id:
        return jsonify({"error":"Error email no encontrado o usuario no registrado"}), 400
    
    label = data.get("label")

    task = Task(
        label=label, # type: ignore
        completed=False, # type: ignore
        user_id=user_id # type: ignore
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Tarea creada"}), 200

@api.route('/tasks', methods=['GET'])
@jwt_required()
def get_user_tasks():
    data = request.get_json()

    if not data or 'email' not in data:
        return jsonify({"error": "Faltan datos para obtener tareas de usuario"}), 400
    
    email = data.get("email")

    usuario = User.query.filter_by(email=email).first()

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 400
    
    tasks = [
        {
            "id": t.id,
            "label": t.label,
            "completed": t.completed
        }
        for t in usuario.tasks
    ]

    return jsonify({"tasks": tasks}), 200

@api.route('/tasks/<int:id>', methods=['PUT'])
@jwt_required()
def update_task_status(id):

    if not id:
        return jsonify({"error": "Faltan datos para poder actualizar la tarea"}), 400
    
    if not Task.query.filter_by(id=id).first():
        return jsonify({"error": "La tarea no existe"}), 404
    
    result = db.session.execute(
        update(Task)
        .where(Task.id==id)
        .values(completed=True)
    )
    if result.rowcount == 0:
        return({"error": "Tarea no encontrada"}), 404
    else:
        db.session.commit()
        return jsonify({"message": "Tarea actualizada"}), 200

@api.route("/tasks/<int:id>", methods=['DELETE'])
@jwt_required()
def delete_task(id):
    if not id:
        return jsonify({"error": "Faltan datos para poder eliminar la tarea"}), 400
    
    task = Task.query.filter_by(id=id).first()

    if not task:
        return jsonify({"error": "Tarea no encontrada"}), 404
    else:
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Tarea eliminada"}), 200
