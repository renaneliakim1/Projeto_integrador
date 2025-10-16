from django.core.management.base import BaseCommand
from core.firebase_config import db, initialize_firebase

class Command(BaseCommand):
    help = 'Populates the Firestore quests collection with initial data'

    def handle(self, *args, **options):
        initialize_firebase()
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

        for quest in quests:
            quest_ref = db.collection('quests').document(quest['id'])
            quest_ref.set(quest)
            self.stdout.write(self.style.SUCCESS(f'Successfully created or updated quest: {quest['id']}'))
