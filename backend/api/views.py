from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .serializers import UserSerializer
from django.utils import timezone
import base64
from firebase_admin import auth
from core.firebase_config import initialize_firebase

# Initialize Firebase if not already done
firebase_db = initialize_firebase()


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            # Handle photo encoding
            foto_base64 = None
            if 'foto' in validated_data and validated_data['foto'] is not None:
                foto_file = validated_data['foto']
                foto_base64 = base64.b64encode(foto_file.read()).decode('utf-8')

            # Create user in Firebase Authentication
            user = auth.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                display_name=validated_data.get('first_name', '')
            )

            # Prepare profile data, converting date to string
            birth_date = validated_data.get('birth_date')
            if birth_date:
                birth_date = birth_date.isoformat()

            profile_data = {
                'birth_date': birth_date,
                'educational_level': validated_data.get('educational_level'),
                'profession': validated_data.get('profession'),
                'focus': validated_data.get('focus'),
                'terms_accepted': validated_data.get('terms_accepted'),
                'foto': foto_base64
            }
            firebase_db.child('user_profiles').child(user.uid).set(profile_data)

            # Create gamification entry in Realtime DB
            gamification_data = {
                'level': 1,
                'xp': 0,
                'streak': 0
            }
            firebase_db.child('gamification').child(user.uid).set(gamification_data)

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

            # Profile data from Realtime DB
            user_profile_ref = firebase_db.child('user_profiles').child(user_id)
            profile_data = user_profile_ref.get() or {}

            # Gamification data from Realtime DB
            gamification_ref = firebase_db.child('gamification').child(user_id)
            gamification_data = gamification_ref.get() or {}

            # Achievements data from Realtime DB
            user_achievements_ref = firebase_db.child('user_achievements').order_by_child('user_id').equal_to(user_id)
            achievements_data = user_achievements_ref.get() or []

            # Daily quests data from Realtime DB
            quests_ref = firebase_db.child('quests').order_by_child('type').equal_to('daily')
            quests_data = quests_ref.get() or {}
            daily_quests_data = []
            for quest_id, quest_data in quests_data.items():
                user_quest_ref = firebase_db.child('user_quests').child(f'{user_id}_{quest_id}_{today}')
                user_quest = user_quest_ref.get()
                quest_data['is_completed'] = user_quest and user_quest.get('is_completed', False)
                daily_quests_data.append(quest_data)

            # Performance data from Realtime DB
            performance_ref = firebase_db.child('user_performances').order_by_child('user_id').equal_to(user_id)
            performance_data = performance_ref.get() or []

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
            user_profile_ref = firebase_db.child('user_profiles').child(request.user_id)

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
                    firebase_db.child('activity_logs').child(f'{user_id}_{today}_pratica').set({
                        'user_id': user_id,
                        'date': today,
                        'type': 'pratica'
                    })
                if incorrect > 0:
                    firebase_db.child('activity_logs').child(f'{user_id}_{today}_falha').set({
                        'user_id': user_id,
                        'date': today,
                        'type': 'falha'
                    })

                # Update performance
                performance_ref = firebase_db.child('user_performances').child(f'{user_id}_{subject_name}')
                current_data = performance_ref.get() or {}
                new_correct = current_data.get('correct_answers', 0) + correct
                new_incorrect = current_data.get('incorrect_answers', 0) + incorrect
                performance_ref.set({
                    'user_id': user_id,
                    'subject': subject_name,
                    'correct_answers': new_correct,
                    'incorrect_answers': new_incorrect
                })

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ActivityLogView(generics.ListAPIView):
    permission_classes = [IsFirebaseAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.user_id
        try:
            logs_ref = firebase_db.child('activity_logs').order_by_child('user_id').equal_to(user_id)
            logs = logs_ref.get() or {}
            logs_list = [log for log in logs.values()]
            return Response(logs_list, status=status.HTTP_200_OK)
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
            gamification_ref = firebase_db.child('gamification').child(user_id)
            gamification_data = gamification_ref.get() or {}

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
            # Assume quests are predefined and fetched from Realtime DB
            quest_ref = firebase_db.child('quests').child(quest_id)
            quest_data = quest_ref.get()

            if not quest_data:
                return Response({'error': 'Quest not found.'}, status=status.HTTP_404_NOT_FOUND)

            xp_reward = quest_data.get('xp_reward', 0)

            user_quest_ref = firebase_db.child('user_quests').child(f'{user_id}_{quest_id}_{today}')

            if user_quest_ref.get():
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
            gamification_ref = firebase_db.child('gamification').child(user_id)
            gamification_data = gamification_ref.get() or {}

            current_level = gamification_data.get('level', 1)
            current_xp = gamification_data.get('xp', 0)

            new_xp = current_xp + xp_reward
            new_level = current_level

            xp_for_next_level = 100 * (current_level ** 1.5)
            while new_xp >= xp_for_next_level:
                new_level += 1
                new_xp -= xp_for_next_level
                xp_for_next_level = 100 * (new_level ** 1.5)

            gamification_ref.update({
                'level': new_level,
                'xp': new_xp
            })

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
