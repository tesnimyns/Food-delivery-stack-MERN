import re
def extract_session_id(session_str:str ):
    match = re.search(r"/sessions/([a-f0-9-]+)", session_str)
    if match:
        extracted_string = match.group(1)
        return extracted_string
    return "Session ID not found"

def get_str_from_food_dict(food_dict: dict):
    return ", ".join([f"{int(value)} {key}" for key, value in food_dict.items()])

if __name__ == "__main__":
    extract_str = "projects/g-chatbot-for-food-delive-qo9m/agent/sessions/2cfbeb95-75c4-657f-5730-e432418aed67/contexts/ongoing-order"
    print(extract_session_id(extract_str))
   