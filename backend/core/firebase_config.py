import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

db = None

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK and returns the Firestore client.

    This function constructs the path to the service account key file dynamically.
    It expects the filename to be set in the `FIREBASE_SERVICE_ACCOUNT_KEY_FILENAME`
    environment variable.
    """
    global db
    try:
        if firebase_admin._apps:
            if not db:
                db = firestore.client()
            print("Firebase already initialized.")
            return db

        service_account_filename = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_FILENAME')

        if not service_account_filename:
            print("WARNING: FIREBASE_SERVICE_ACCOUNT_KEY_FILENAME environment variable not set. Firebase will not be initialized.")
            return None

        # Construct the path to the key file relative to the backend directory
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        service_account_key_path = os.path.join(backend_dir, service_account_filename)

        if not os.path.exists(service_account_key_path):
            print(f"WARNING: Firebase service account key file not found at: {service_account_key_path}. Firebase will not be initialized.")
            return None

        cred = credentials.Certificate(service_account_key_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized successfully.")
        return db

    except Exception as e:
        print(f"ERROR: Failed to initialize Firebase: {e}")
        return None
