from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import PyMongoError



app = FastAPI()

# Connexion à MongoDB
MONGO_URI = "mongodb+srv://tesnimyounes:14037534@cluster0.hkntdbv.mongodb.net/application_web_food_delivery"
DB_NAME = "application_web_food_delivery"
COLLECTION_NAME = "orders"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
orders_collection = db[COLLECTION_NAME]
order_items_collection = db["order_items"]


# async def get_order_status(order_id: str):
#     """ Récupère le statut d'une commande via son ID """
#     try:
#         order_object_id =int(order_id)
#     except:
#         raise HTTPException(status_code=400, detail="Format de l'ID invalide")

#     order = await orders_collection.find_one({"order_id": order_object_id})

#     if order:
#         return {"order_id": order["order_id"], "status": order.get("status", "Unknown")}
#     else:
#         return None  # Retourne None si la commande n'existe pas



async def get_order_status(order_id: int):
    """ Récupère le statut d'une commande via son ID """
    print(f"🔹 Requête MongoDB pour order_id: {order_id}")

    order = await orders_collection.find_one({"order_id": order_id})

    if order:
        print(f"✅ Commande trouvée : {order}")
        return {"order_id": order["order_id"], "status": order.get("status", "Unknown")}
    else:
        print(f"❌ Aucune commande trouvée avec l'ID {order_id}")
        return None

async def get_next_order_id():
    last_order = await orders_collection.find_one({}, sort=[("order_id", -1)])  
    if last_order is None:
        return 1 
    return last_order["order_id"] + 1  


async def save_order(order: dict):
    next_order_id = await get_next_order_id()
    for food_item, quantity in order.items():
        rcode = await insert_order_item(
            food_item,
            quantity,
            next_order_id
        
        )
        if rcode == -1:
            return -1
    await orders_collection.insert_one({
        "order_id": next_order_id,
        "status": "Pending"
    })

    return next_order_id



async def insert_order_item(food_item, quantity, order_id):
    try:
        # Création du document à insérer
        order_item = {
            "food_item": food_item,
            "quantity": quantity,
            "order_id": order_id
        }

        # Insertion dans la collection
        await order_items_collection.insert_one(order_item)
        print("Order item inserted successfully!")
        return 1

    except PyMongoError as err:
        print(f"Error inserting order item: {err}")
        return -1

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return -1
    
    
async def get_total_order_price(order_id):
    total_price = 0

    try:
        # Récupérer tous les items de la commande
        order_items_cursor = orders_collection.find({"order_id": order_id})
        async for item in order_items_cursor:
            food_item_name = item.get("food_item")
            quantity = item.get("quantity", 1)

            # Chercher le prix dans la collection foods
            food_data = await db["foods"].find_one({"name": food_item_name})
            if food_data:
                price = food_data.get("price", 0)
                total_price += price * quantity
            else:
                print(f"⚠️ Aucun produit trouvé pour : {food_item_name}")

    except Exception as e:
        print(f" Erreur lors du calcul du total : {e}")
        return -1

    return total_price
    

async def update_order_status(next_order_id: int, new_status: str):
    try:
        result = await db["orders"].update_one(
            {"order_id": next_order_id},
            {"$set": {"status": new_status}}
        )

        if result.modified_count == 1:
            print(f"✅ Statut de la commande {next_order_id} mis à jour en '{new_status}'")
            return 1
        else:
            print(f"⚠️ Aucune commande mise à jour. Vérifie si order_id={next_order_id} existe.")
            return -1
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour du statut : {e}")
        return -1
