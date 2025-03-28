
import requests
from typing import List, Dict, Optional, Any, Union
from dataclasses import dataclass
import json

@dataclass
class Avatar:
    tokenId: str
    name: str
    description: str
    attributes: List[Dict[str, str]]
    media: Optional[Dict[str, str]] = None
    evolution: Optional[Dict[str, Any]] = None
    memory: Optional[Dict[str, str]] = None

@dataclass
class Item:
    tokenId: str
    name: str
    description: str
    attributes: List[Dict[str, str]]
    media: Optional[Dict[str, str]] = None
    evolution: Optional[Dict[str, Any]] = None

@dataclass
class Location:
    tokenId: str
    name: str
    description: str
    attributes: List[Dict[str, str]]
    media: Optional[Dict[str, str]] = None
    currentAvatars: Optional[List[str]] = None

@dataclass
class Memory:
    id: str
    avatarId: str
    timestamp: str
    content: str
    type: str
    locationId: Optional[str] = None
    relatedEntities: Optional[List[Dict[str, str]]] = None

@dataclass
class ChatRequest:
    avatarId: str
    message: str
    locationId: Optional[str] = None

@dataclass
class ChatResponse:
    response: str
    avatarId: str
    avatarName: str

class RATiVerseClient:
    """
    Python client for the RATiverse API
    """
    
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        """
        Initialize the RATiverse client
        
        Args:
            base_url: Base URL for the API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'Authorization': f'Bearer {api_key}'})
        
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Any:
        """
        Make a request to the API
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            **kwargs: Additional arguments to pass to requests
            
        Returns:
            JSON response from the API
        """
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        
        if not response.ok:
            try:
                error = response.json()
                message = error.get('error', 'Unknown error')
            except:
                message = 'Unknown error'
            
            raise Exception(f"API Error ({response.status_code}): {message}")
        
        return response.json()
    
    # Avatar methods
    def get_all_avatars(self) -> List[Avatar]:
        """Get all avatars"""
        data = self._request('GET', '/api/avatars')
        return [Avatar(**avatar) for avatar in data]
    
    def get_avatar(self, avatar_id: str) -> Avatar:
        """Get a specific avatar by ID"""
        data = self._request('GET', f'/api/avatars/{avatar_id}')
        return Avatar(**data)
    
    def get_avatar_memory(self, avatar_id: str) -> List[Memory]:
        """Get memories for a specific avatar"""
        data = self._request('GET', f'/api/avatars/{avatar_id}/memory')
        return [Memory(**memory) for memory in data]
    
    # Item methods
    def get_all_items(self) -> List[Item]:
        """Get all items"""
        data = self._request('GET', '/api/items')
        return [Item(**item) for item in data]
    
    def get_item(self, item_id: str) -> Item:
        """Get a specific item by ID"""
        data = self._request('GET', f'/api/items/{item_id}')
        return Item(**data)
    
    # Location methods
    def get_all_locations(self) -> List[Location]:
        """Get all locations"""
        data = self._request('GET', '/api/locations')
        return [Location(**location) for location in data]
    
    def get_location(self, location_id: str) -> Location:
        """Get a specific location by ID"""
        data = self._request('GET', f'/api/locations/{location_id}')
        return Location(**data)
    
    def get_avatars_in_location(self, location_id: str) -> List[Avatar]:
        """Get all avatars in a specific location"""
        data = self._request('GET', f'/api/locations/{location_id}/avatars')
        return [Avatar(**avatar) for avatar in data]
    
    # Chat method
    def chat_with_avatar(self, request: ChatRequest) -> ChatResponse:
        """Chat with an avatar"""
        request_dict = {
            'avatarId': request.avatarId,
            'message': request.message
        }
        
        if request.locationId:
            request_dict['locationId'] = request.locationId
        
        data = self._request('POST', '/api/chat', json=request_dict)
        return ChatResponse(**data)

# Example usage
if __name__ == "__main__":
    # Initialize client
    client = RATiVerseClient("http://localhost:3000")
    
    # Get all avatars
    try:
        avatars = client.get_all_avatars()
        print(f"Found {len(avatars)} avatars")
        
        # If there are avatars, chat with the first one
        if avatars:
            avatar = avatars[0]
            print(f"Selected avatar: {avatar.name}")
            
            chat_request = ChatRequest(
                avatarId=avatar.tokenId,
                message="Hello, how are you today?"
            )
            
            response = client.chat_with_avatar(chat_request)
            print(f"{avatar.name} says: {response.response}")
    except Exception as e:
        print(f"Error: {e}")
