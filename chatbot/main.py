from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import BD_helper  
import generic_helper
from fastapi.middleware.cors import CORSMiddleware
import requests



app = FastAPI()

# Autoriser le frontend React (localhost:3000 ou tout domaine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pour plus de sécurité, remplacer par ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat_from_frontend(request: Request):
    body = await request.json()
    user_message = body.get("message", "")

    # ⚠️ Remplace ceci par ton vrai ID de projet Dialogflow
    dialogflow_url = "https://dialogflow.cloud.google.com/#/agent/g-chatbot-for-food-delive-qo9m"

    # ⚠️ Token d'accès (compte de service avec rôle Dialogflow API Client)
    headers = {
        "Authorization": "Bearer YOUR_ACCESS_TOKEN",
        "Content-Type": "application/json"
    }

    # Structure attendue par Dialogflow
    payload = {
        "queryInput": {
            "text": {
                "text": user_message,
                "languageCode": "en"
            }
        }
    }

    try:
        response = requests.post(dialogflow_url, headers=headers, json=payload)
        response_data = response.json()

        fulfillment = response_data.get("queryResult", {}).get("fulfillmentText", "Je n'ai pas compris.")
        return {"response": fulfillment}

    except Exception as e:
        print("Erreur :", str(e))
        return {"response": "Une erreur est survenue côté serveur."}





inprogress_orders = {}

@app.post("/")
async def handle_request(request: Request):
    payload = await request.json()
    print(f"Received payload: {payload}")

    
    # Extraction des données envoyées par Dialogflow
    intent = payload["queryResult"]["intent"]["displayName"]
    parameters = payload["queryResult"]["parameters"]
    output_contexts = payload["queryResult"]["outputContexts"]

    
    
    session_id = generic_helper.extract_session_id(output_contexts[0]['name'])

    

    intent_handler_dict = {
        "track.order-context: ongoing-tracking": track_order,
        "order.add-context:ongoing-order" : add_to_order,
        "order.complete-context:ongoing-order" : complete_order,
        "order.remove-context:ongoing-order":remove_from_order
    }


    if intent in intent_handler_dict:
        return await intent_handler_dict[intent](parameters,session_id)

async def remove_from_order(parameters: dict,session_id:str):
    if session_id not in inprogress_orders:
        return JSONResponse(content={"fulfillmentText": "No ongoing order found."})
    
    current_order = inprogress_orders[session_id] 
    food_items = parameters["food-item"]

    removed_items = []
    no_such_items = []
    for item in food_items:
        if item in current_order:
            del current_order[item]
        else:
            no_such_items.append(item)
            return JSONResponse(content={"fulfillmentText": f"{item} is not in your order."})
    if len(removed_items) > 0:
        fullfillment_text = f"Removed {', '.join(removed_items)} from your order."
    if len(no_such_items) > 0:
        fullfillment_text = f"{', '.join(no_such_items)} are not in your order."
    if len(current_order.keys()) == 0:
        fullfillment_text = "Your order is empty !"
    else:
        order_str = generic_helper.get_str_from_food_dict(current_order)
    
    return JSONResponse(content={"fulfillmentText": fullfillment_text})
        

    
async def add_to_order(parameters: dict,session_id:str):
    food_items = parameters["food-item"]
    quantities = parameters["number"]

    # Debugging logs
    print(f"Received food items: {food_items}")  
    print(f"Received quantities: {quantities}")  
    print(f"Session ID: {session_id}")  


    if len(food_items) != len(quantities):
        fulfillment_text = "Sorry I didn't understand. Can you please specify food items and quantities clearly"
    else:

        new_food_dict = dict (zip(food_items,quantities))

        if session_id in inprogress_orders:
            current_food_dict = inprogress_orders[session_id]
            current_food_dict.update(new_food_dict)
            inprogress_orders[session_id] = current_food_dict

        else:
            inprogress_orders[session_id] = new_food_dict


        order_str = generic_helper.get_str_from_food_dict(inprogress_orders[session_id])

        

        fulfillment_text = f"So far You have :{order_str}. Do you need anything else ?"

    return JSONResponse(content={"fulfillmentText": fulfillment_text})



async def complete_order(parameters: dict,session_id:str):
    print("==== DEBUG complete_order ====")
    print("Session ID reçu :", session_id)
    print("inprogress_orders keys:", list(inprogress_orders.keys()))
    print("Commande associée :", inprogress_orders.get(session_id))

    if session_id not in inprogress_orders:
        fulfillment_text = f"I'm having a trouble finding your order. Sorry ! Can you place a new order ?"
    else:
        order = inprogress_orders[session_id]
        save_to_db = await BD_helper.save_order(order)
        order_id = save_to_db

        if order_id == -1:
            fulfillment_text = "Sorry, there was an error while saving your order." 
        else:
            order_total = await  BD_helper.get_total_order_price(order_id)
            fulfillment_text = f"Your order has been placed successfully. Your order ID is {order_id}. The total amount is {order_total}."
        
        del inprogress_orders[session_id]
    return JSONResponse(content={"fulfillmentText": fulfillment_text})


async def save_to_db(order: dict):
    next_order_id = await BD_helper.get_next_order_id()
    for food_item, quantity in order.items():
        rcode = await BD_helper.insert_order_item(
            food_item,
            quantity,
            next_order_id
        )

        if rcode == -1:
            return -1
        

    await BD_helper.update_order_status(next_order_id,"Pending")
    return next_order_id


async def track_order(parameters: dict, session_id:str):
    
    order_id = parameters.get("order_id")
    
    if not order_id:
        return JSONResponse(content={"fulfillmentText": "Order ID is missing in the request."})
    
    try:
      
        order_id_int = int(float(order_id))
    except ValueError:
        return JSONResponse(content={"fulfillmentText": "Invalid order ID format."})

    order_status = await BD_helper.get_order_status(order_id)

    if order_status:
        fulfillment_text = f"The status of order {order_id} is : {order_status['status']}."
    else:
        fulfillment_text = f"Order {order_id} not found."


    

    return JSONResponse(content={"fulfillmentText": fulfillment_text})


