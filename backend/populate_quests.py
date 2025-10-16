import os
import sys
from dotenv import load_dotenv

# Add the backend directory to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env file
load_dotenv()

from core.firebase_config import initialize_firebase

def populate_quests():
    db = initialize_firebase()
    quests = [
        {
            'id': 'daily_login',
            'description': 'Faça login em um dia.',
            'xp_reward': 10,
            'type': 'daily'
        },
        {
            'id': 'complete_3_lessons',
            'description': 'Complete 3 lições.',
            'xp_reward': 50,
            'type': 'daily'
        },
        {
            'id': 'first_achievement',
            'description': 'Conquiste seu primeiro emblema.',
            'xp_reward': 100,
            'type': 'achievement'
        }
    ]

    if not db:
        print("DB not initialized, cannot populate quests.")
        return

    for quest in quests:
        quest_ref = db.collection('quests').document(quest['id'])
        quest_ref.set(quest)
        print(f'Successfully created or updated quest: {quest['id']}')

if __name__ == '__main__':
    populate_quests()
