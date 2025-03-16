from flask import Blueprint, request, jsonify
from Utils.operations import check_params
import json

def create_user_blueprint(UserModel,MapModel):
    user_bp = Blueprint('user', __name__)

    @user_bp.route("/login",methods=["POST"])
    def log_in():
        data = json.loads(request.data)
        
        response=check_params(data=data,params=["userName","password"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400

        userName=str(data["userName"])
        password=str(data["password"])
        response=UserModel.log_in(user_name=userName,password=password)
        if(response!=None):
            return {"response": "Log In succesfull","userID":response[0]}, 200
        else:
            return {"error": "Username does not exist or incorrect password"}, 400
        

    @user_bp.route("/addUser",methods=["POST"])
    def create_new_user():
        data = json.loads(request.data)

        response=check_params(data=data,params=["userName","password"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400

        userName=str(data["userName"])
        if(UserModel.userName_exists(user_name=userName)==True):
            return {"error": "This user already exist"}, 400
        
        password=str(data["password"])
        
        userID=UserModel.add_user(user_name=userName, password=password)

        return {"response": "User added succesfully","userID":userID}, 200

    @user_bp.route("/updateUser",methods=["POST"])
    def update_user():
        data = json.loads(request.data)

        response=check_params(data=data,params=["userID","userName","password"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400

        userID=str(data["userID"])
        if(UserModel.user_exists(user_id=userID)==False):
            return {"error": "This user does not exist"}, 400
        
        userName=str(data["userName"])
        if(UserModel.userName_exists(user_name=userName)==True):
            return {"error": "This user already exist"}, 400
        
        password=str(data["password"])
        if(UserModel.modify_user(user_id=userID,user_name=userName,password=password)):
            return {"Succesfull": "updated succesfull"}, 200
        
    @user_bp.route("/getMaps",methods=["POST"])
    def get_user_maps():
        data = json.loads(request.data)
        response=check_params(data=data,params=["userID"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400
        
        userID=str(data["userID"])
        
        if(UserModel.user_exists(user_id=userID)==False):
            return {"error": "This user does not exist"}, 400
        
        parkings=MapModel.get_user_maps(user_id=userID)
        
        return jsonify({"response":parkings}),200


    @user_bp.route("/deleteUser",methods=["POST"])
    def delete_user():
        data = json.loads(request.data)

        response=check_params(data=data,params=["userID"])
        if(len(response)>0):
            return jsonify({"error": f"Fields {response} are required"}), 400
        
        userID=str(data["userID"])
        
        if(UserModel.user_exists(user_id=userID)==False):
            return {"error": "This user does not exist"}, 400
        
        parkings=MapModel.get_user_maps(user_id=userID)

        for i,parking_data in parkings.items():
            if(MapModel.delete_parking(id_parking=parking_data["parking_id"])!=True):
                parking_name=parking_data["parking_name"]
                return {"error":f"Error in delete {parking_name} parking, cannot delete user"}
        
        if(UserModel.delete_user(user_id=userID)):
            return {"Succesful": "User deleted succesfully"}, 200
        

    return user_bp