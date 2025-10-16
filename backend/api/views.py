from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .serializers import UserSerializer
from django.utils import timezone
import base64
from firebase_admin import auth, firestore
from core.firebase_config import db


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            # Create user in Firebase Authentication
            user = auth.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                display_name=validated_data.get('first_name', '')
            )

            # Create user profile in Firestore
            profile_data = {
                'birth_date': validated_data.get('birth_date'),
                'educational_level': validated_data.get('educational_level'),
                'profession': validated_data.get('profession'),
                'focus': validated_data.get('focus'),
                'terms_accepted': validated_data.get('terms_accepted'),
                'foto': None  # Photo upload will be handled separately
            }
            db.collection('user_profiles').document(user.uid).set(profile_data)

            # Create gamification entry in Firestore
            gamification_data = {
                'level': 1,
                'xp': 0,
                'streak': 0
            }
            db.collection('gamification').document(user.uid).set(gamification_data)

            # Generate custom token for the user
            custom_token = auth.create_custom_token(user.uid)

            return Response({'token': custom_token.decode('utf-8')}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class IsFirebaseAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return False

        try:
            id_token = auth_header.split(' ').pop()
            decoded_token = auth.verify_id_token(id_token)
            request.user_id = decoded_token['uid']
            return True
        except Exception as e:
            return False

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsFirebaseAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        try:
            user_id = request.user_id
            today = timezone.now().date().isoformat()

            # Basic user data from Firebase Auth
            user_data = auth.get_user(user_id)

            # Profile data from Firestore
            user_profile_ref = db.collection('user_profiles').document(user_id)
            user_profile = user_profile_ref.get()
            profile_data = user_profile.to_dict() if user_profile.exists else {}

            # Gamification data from Firestore
            gamification_ref = db.collection('gamification').document(user_id)
            gamification = gamification_ref.get()
            gamification_data = gamification.to_dict() if gamification.exists else {}

            # Achievements data from Firestore
            user_achievements_ref = db.collection('user_achievements').where('user_id', '==', user_id).stream()
            achievements_.data = [ach.to_dict() for ach in user_achievements_ref]

            # Daily quests data from Firestore
            quests_ref = db.collection('quests').where('type', '==', 'daily').stream()
            daily_quests_data = []
            for quest in quests_ref:
                user_quest_ref = db.collection('user_quests').document(f'{user_id}_{quest.id}_{today}')
                user_quest = user_quest_ref.get()
                quest_data = quest.to_dict()
                quest_data['is_completed'] = user_quest.exists and user_quest.to_dict().get('is_completed', False)
                daily_quests_data.append(quest_data)

            # Performance data from Firestore
            performance_ref = db.collection('user_performances').where('user_id', '==', user_id).stream()
            performance_data = [p.to_dict() for p in performance_ref]

            response_data = {
                'id': user_data.uid,
                'username': user_data.display_name,
                'email': user_data.email,
                'profile': profile_data,
                'gamification': gamification_data,
                'achievements': achievements_data,
                'daily_quests': daily_quests_data,
                'performance': performance_data
            }

            return Response(response_data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            user_profile_ref = db.collection('user_profiles').document(request.user_id)
            
            # Fields to update
            update_data = {}
            allowed_fields = ['birth_date', 'educational_level', 'profession', 'focus']

            for field in allowed_fields:
                if field in request.data:
                    update_data[field] = request.data[field]

            if update_data:
                user_profile_ref.update(update_data)

            # Update display name in Firebase Auth
            if 'first_name' in request.data:
                auth.update_user(request.user_id, display_name=request.data['first_name'])

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdatePerformanceView(generics.GenericAPIView):
    permission_classes = [IsFirebaseAuthenticated]

    def post(self, request, *args, **kwargs):
        results = request.data.get('results', [])
        user_id = request.user_id
        today = timezone.now().date().isoformat()

        try:
            for result in results:
                subject_name = result.get('subject')
                correct = result.get('correct', 0)
                incorrect = result.get('incorrect', 0)

                if not subject_name:
                    continue

                # Log activity
                if correct > 0:
                    activity_log_ref = db.collection('activity_logs').document(f'{user_id}_{today}_pratica')
                    activity_log_ref.set({
                        'user_id': user_id,
                        'date': today,
                        'type': 'pratica'
                    })
                if incorrect > 0:
                    activity_log_ref = db.collection('activity_logs').document(f'{user_id}_{today}_falha')
                    activity_log_ref.set({
                        'user_id': user_id,
                        'date': today,
                        'type': 'falha'
                    })

                # Update performance
                performance_ref = db.collection('user_performances').document(f'{user_id}_{subject_name}')

                @firestore.transactional
                def update_in_transaction(transaction, doc_ref):
                    snapshot = doc_ref.get(transaction=transaction)
                    if snapshot.exists:
                        transaction.update(doc_ref, {
                            'correct_answers': firestore.Increment(correct),
                            'incorrect_answers': firestore.Increment(incorrect)
                        })
                    else:
                        transaction.set(doc_ref, {
                            'user_id': user_id,
                            'subject': subject_name,
                            'correct_answers': correct,
                            'incorrect_answers': incorrect
                        })
                
                transaction = db.transaction()
                update_in_transaction(transaction, performance_ref)

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ActivityLogView(generics.ListAPIView):
    permission_classes = [IsFirebaseAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.user_id
        try:
            logs_ref = db.collection('activity_logs').where('user_id', '==', user_id).stream()
            logs = [log.to_dict() for log in logs_ref]
            return Response(logs, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello, world!"})

class AddXpView(generics.GenericAPIView):
    permission_classes = [IsFirebaseAuthenticated]

    def post(self, request, *args, **kwargs):
        amount = request.data.get('amount', 0)
        user_id = request.user_id

        try:
            gamification_ref = db.collection('gamification').document(user_id)
            gamification_doc = gamification_ref.get()

            if not gamification_doc.exists:
                return Response({'error': 'Gamification data not found for this user.'}, status=status.HTTP_404_NOT_FOUND)

            gamification_data = gamification_doc.to_dict()
            
            current_level = gamification_data.get('level', 1)
            current_xp = gamification_data.get('xp', 0)
            
            new_xp = current_xp + amount
            new_level = current_level

            # Check for level up
            xp_for_next_level = 100 * (current_level ** 1.5)
            while new_xp >= xp_for_next_level:
                new_level += 1
                new_xp -= xp_for_next_level
                xp_for_next_level = 100 * (new_level ** 1.5)

            gamification_ref.update({
                'level': new_level,
                'xp': new_xp
            })
            
            return Response({
                'new_level': new_level,
                'new_xp': new_xp
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteQuestView(generics.GenericAPIView):
    permission_classes = [IsFirebaseAuthenticated]

    def post(self, request, quest_id, *args, **kwargs):
        user_id = request.user_id
        today = timezone.now().date().isoformat()

        try:
            # Assume quests are predefined and fetched from a 'quests' collection
            quest_ref = db.collection('quests').document(quest_id)
            quest_doc = quest_ref.get()

            if not quest_doc.exists:
                return Response({'error': 'Quest not found.'}, status=status.HTTP_404_NOT_FOUND)

            quest_data = quest_doc.to_dict()
            xp_reward = quest_data.get('xp_reward', 0)

            user_quest_ref = db.collection('user_quests').document(f'{user_id}_{quest_id}_{today}')

            if user_quest_ref.get().exists:
                # Quest already completed today
                return Response(status=status.HTTP_204_NO_CONTENT)

            # Mark quest as completed
            user_quest_ref.set({
                'user_id': user_id,
                'quest_id': quest_id,
                'quest_date': today,
                'is_completed': True
            })

            # Add XP and potentially level up
            gamification_ref = db.collection('gamification').document(user_id)

            @firestore.transactional
            def update_xp_in_transaction(transaction, gamification_ref, amount):
                snapshot = gamification_ref.get(transaction=transaction)
                if not snapshot.exists:
                    # This case should ideally not happen if gamification data is created at user registration
                    return

                current_data = snapshot.to_dict()
                current_level = current_data.get('level', 1)
                current_xp = current_data.get('xp', 0)

                new_xp = current_xp + amount
                new_level = current_level

                xp_for_next_level = 100 * (current_level ** 1.5)
                while new_xp >= xp_for_next_level:
                    new_level += 1
                    new_xp -= xp_for_next_level
                    xp_for_next_level = 100 * (new_level ** 1.5)

                transaction.update(gamification_ref, {
                    'level': new_level,
                    'xp': int(new_xp)
                })

            transaction = db.transaction()
            update_xp_in_transaction(transaction, gamification_ref, xp_reward)

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)