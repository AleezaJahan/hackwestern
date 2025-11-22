"""Example usage of the AI & Voice Integration API."""
import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_alarm_trigger():
    """Test alarm trigger endpoint."""
    print("\n" + "="*70)
    print("Testing Alarm Trigger")
    print("="*70)
    
    # Test initial alarm (snooze_count = 0)
    response = requests.post(
        f"{BASE_URL}/alarm/trigger",
        json={"snooze_count": 0, "user_id": "test_user"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test after 3 snoozes
    response = requests.post(
        f"{BASE_URL}/alarm/trigger",
        json={"snooze_count": 3, "user_id": "test_user"}
    )
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test nuclear level (7+ snoozes)
    response = requests.post(
        f"{BASE_URL}/alarm/trigger",
        json={"snooze_count": 8, "user_id": "test_user"}
    )
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_excuse_analysis():
    """Test excuse analysis endpoint."""
    print("\n" + "="*70)
    print("Testing Excuse Analysis")
    print("="*70)
    
    excuses = [
        {"excuse": "Just 5 more minutes", "snooze_count": 1},
        {"excuse": "I'm too tired", "snooze_count": 3},
        {"excuse": "My cat is sleeping on me", "snooze_count": 5},
        {"excuse": "I had a late night", "snooze_count": 7}
    ]
    
    for excuse_data in excuses:
        response = requests.post(
            f"{BASE_URL}/excuse/analyze",
            json=excuse_data
        )
        print(f"\nExcuse: '{excuse_data['excuse']}' (Snooze: {excuse_data['snooze_count']})")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Roast: {result.get('roast', 'N/A')}")
            print(f"Level: {result.get('level', 'N/A')}")


def test_sentiment_analysis():
    """Test sentiment analysis endpoint."""
    print("\n" + "="*70)
    print("Testing Sentiment Analysis")
    print("="*70)
    
    response = requests.post(
        f"{BASE_URL}/excuse/sentiment",
        json={
            "excuse": "I'm really tired today",
            "snooze_count": 2,
            "transcribed_audio": "I'm really tired today"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_snooze_handling():
    """Test complete snooze handling endpoint."""
    print("\n" + "="*70)
    print("Testing Snooze Handling")
    print("="*70)
    
    response = requests.post(
        f"{BASE_URL}/snooze",
        json={
            "excuse": "One more minute, I promise!",
            "snooze_count": 5,
            "user_id": "test_user",
            "transcribed_audio": "One more minute, I promise!"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Roast: {result.get('roast', 'N/A')}")
        print(f"Audio URL: {result.get('audio_url', 'N/A')}")
        print(f"Level: {result.get('level', 'N/A')}")
    else:
        print(f"Error: {response.text}")


def test_social_media_threat():
    """Test social media threat generation."""
    print("\n" + "="*70)
    print("Testing Social Media Threat")
    print("="*70)
    
    response = requests.post(
        f"{BASE_URL}/social-media/threat",
        params={"snooze_count": 7, "user_id": "test_user"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_health_check():
    """Test health check endpoints."""
    print("\n" + "="*70)
    print("Testing Health Checks")
    print("="*70)
    
    # Root endpoint
    response = requests.get(f"{BASE_URL}/")
    print(f"Root endpoint status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Health endpoint
    response = requests.get(f"{BASE_URL}/health")
    print(f"\nHealth endpoint status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("Passive-Aggressive Alarm Clock - API Example Usage")
    print("="*70)
    print(f"\nMake sure the server is running at {BASE_URL}")
    print("Start the server with: python main.py or python run.py")
    print("\nPress Enter to continue...")
    input()
    
    try:
        # Test health checks first
        test_health_check()
        
        # Test alarm trigger
        # test_alarm_trigger()
        
        # Test excuse analysis
        # test_excuse_analysis()
        
        # Test sentiment analysis
        # test_sentiment_analysis()
        
        # Test snooze handling
        # test_snooze_handling()
        
        # Test social media threat
        # test_social_media_threat()
        
        print("\n" + "="*70)
        print("Example tests completed!")
        print("="*70)
        print("\nNote: Uncomment the test functions above to run full tests.")
        print("Make sure your API keys are configured in .env file.")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the server.")
        print(f"Make sure the server is running at {BASE_URL}")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

