
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the OpenAPI specification
router.get('/', (req, res) => {
  res.json(getOpenApiSpec());
});

function getOpenApiSpec() {
  return {
    "openapi": "3.0.0",
    "info": {
      "title": "RATi Avatar API",
      "description": "API for interacting with the RATi ecosystem of autonomous avatars, items, and locations",
      "version": "1.0.0",
      "contact": {
        "name": "RATi API Support",
        "url": "https://ratimics.com/support"
      }
    },
    "servers": [
      {
        "url": "/api",
        "description": "Main API server"
      }
    ],
    "tags": [
      {
        "name": "avatars",
        "description": "Operations about avatars"
      },
      {
        "name": "items",
        "description": "Operations about items"
      },
      {
        "name": "locations",
        "description": "Operations about locations"
      },
      {
        "name": "memories",
        "description": "Operations about avatar memories"
      },
      {
        "name": "chat",
        "description": "Chat operations with avatars"
      }
    ],
    "paths": {
      "/avatars": {
        "get": {
          "tags": ["avatars"],
          "summary": "Get all avatars",
          "parameters": [
            {
              "name": "limit",
              "in": "query",
              "description": "Maximum number of avatars to return",
              "schema": {
                "type": "integer",
                "default": 20
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "Number of avatars to skip",
              "schema": {
                "type": "integer",
                "default": 0
              }
            },
            {
              "name": "status",
              "in": "query",
              "description": "Filter by avatar status",
              "schema": {
                "type": "string",
                "enum": ["alive", "dead", "all"]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Avatar"
                        }
                      },
                      "total": {
                        "type": "integer"
                      },
                      "limit": {
                        "type": "integer"
                      },
                      "offset": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/avatars/{id}": {
        "get": {
          "tags": ["avatars"],
          "summary": "Get avatar by ID",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Avatar"
                  }
                }
              }
            },
            "404": {
              "description": "Avatar not found"
            }
          }
        }
      },
      "/avatars/name/{name}": {
        "get": {
          "tags": ["avatars"],
          "summary": "Get avatar by name",
          "parameters": [
            {
              "name": "name",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Avatar"
                  }
                }
              }
            },
            "404": {
              "description": "Avatar not found"
            }
          }
        }
      },
      "/avatars/{id}/inventory": {
        "get": {
          "tags": ["avatars"],
          "summary": "Get avatar's inventory",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Item"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Avatar not found"
            }
          }
        }
      },
      "/items": {
        "get": {
          "tags": ["items"],
          "summary": "Get all items",
          "parameters": [
            {
              "name": "limit",
              "in": "query",
              "description": "Maximum number of items to return",
              "schema": {
                "type": "integer",
                "default": 20
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "Number of items to skip",
              "schema": {
                "type": "integer",
                "default": 0
              }
            },
            {
              "name": "locationId",
              "in": "query",
              "description": "Filter by location ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Item"
                        }
                      },
                      "total": {
                        "type": "integer"
                      },
                      "limit": {
                        "type": "integer"
                      },
                      "offset": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/items/{id}": {
        "get": {
          "tags": ["items"],
          "summary": "Get item by ID",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Item"
                  }
                }
              }
            },
            "404": {
              "description": "Item not found"
            }
          }
        }
      },
      "/locations": {
        "get": {
          "tags": ["locations"],
          "summary": "Get all locations",
          "parameters": [
            {
              "name": "limit",
              "in": "query",
              "description": "Maximum number of locations to return",
              "schema": {
                "type": "integer",
                "default": 20
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "Number of locations to skip",
              "schema": {
                "type": "integer",
                "default": 0
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Location"
                        }
                      },
                      "total": {
                        "type": "integer"
                      },
                      "limit": {
                        "type": "integer"
                      },
                      "offset": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/locations/{id}": {
        "get": {
          "tags": ["locations"],
          "summary": "Get location by ID",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Location"
                  }
                }
              }
            },
            "404": {
              "description": "Location not found"
            }
          }
        }
      },
      "/locations/{id}/avatars": {
        "get": {
          "tags": ["locations"],
          "summary": "Get avatars in a location",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Avatar"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Location not found"
            }
          }
        }
      },
      "/locations/{id}/items": {
        "get": {
          "tags": ["locations"],
          "summary": "Get items in a location",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Item"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Location not found"
            }
          }
        }
      },
      "/memories/{avatarId}": {
        "get": {
          "tags": ["memories"],
          "summary": "Get memories for an avatar",
          "parameters": [
            {
              "name": "avatarId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "Maximum number of memories to return",
              "schema": {
                "type": "integer",
                "default": 20
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "Number of memories to skip",
              "schema": {
                "type": "integer",
                "default": 0
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Memory"
                        }
                      },
                      "total": {
                        "type": "integer"
                      },
                      "limit": {
                        "type": "integer"
                      },
                      "offset": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Avatar not found"
            }
          }
        }
      },
      "/chat/avatars/{avatarId}": {
        "post": {
          "tags": ["chat"],
          "summary": "Chat with an avatar",
          "parameters": [
            {
              "name": "avatarId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["message"],
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "The message to send to the avatar"
                    },
                    "channelId": {
                      "type": "string",
                      "description": "Optional channel context"
                    },
                    "contextSize": {
                      "type": "integer",
                      "description": "Amount of context to include",
                      "default": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "response": {
                        "type": "string",
                        "description": "The avatar's response"
                      },
                      "avatarId": {
                        "type": "string"
                      },
                      "avatarName": {
                        "type": "string"
                      },
                      "timestamp": {
                        "type": "string",
                        "format": "date-time"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Avatar not found"
            }
          }
        }
      },
      "/chat/group": {
        "post": {
          "tags": ["chat"],
          "summary": "Group chat with multiple avatars",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["message", "avatarIds"],
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "The message to send to the avatars"
                    },
                    "avatarIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "List of avatar IDs to include in the chat"
                    },
                    "channelId": {
                      "type": "string",
                      "description": "Optional channel context"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "response": {
                          "type": "string",
                          "description": "The avatar's response"
                        },
                        "avatarId": {
                          "type": "string"
                        },
                        "avatarName": {
                          "type": "string"
                        },
                        "timestamp": {
                          "type": "string",
                          "format": "date-time"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "Avatar": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "personality": {
              "type": "string"
            },
            "dynamicPersonality": {
              "type": "string"
            },
            "emoji": {
              "type": "string"
            },
            "imageUrl": {
              "type": "string"
            },
            "status": {
              "type": "string",
              "enum": ["alive", "dead"]
            },
            "lives": {
              "type": "integer"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            },
            "evolution": {
              "type": "object",
              "properties": {
                "level": {
                  "type": "integer"
                },
                "previous": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "timestamp": {
                  "type": "string",
                  "format": "date-time"
                }
              }
            },
            "parents": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "summoner": {
              "type": "string"
            },
            "channelId": {
              "type": "string"
            },
            "tokenId": {
              "type": "string"
            },
            "arweave_prompt": {
              "type": "string"
            },
            "NFTAttributes": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "trait_type": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "Item": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "emoji": {
              "type": "string"
            },
            "imageUrl": {
              "type": "string"
            },
            "rarity": {
              "type": "string",
              "enum": ["common", "uncommon", "rare", "legendary"]
            },
            "owner": {
              "type": "string"
            },
            "locationId": {
              "type": "string"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            },
            "tokenId": {
              "type": "string"
            },
            "NFTAttributes": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "trait_type": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "Location": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "imageUrl": {
              "type": "string"
            },
            "type": {
              "type": "string",
              "enum": ["dungeon", "town", "wilderness", "special"]
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            },
            "tokenId": {
              "type": "string"
            },
            "NFTAttributes": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "trait_type": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "Memory": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "avatarId": {
              "type": "string"
            },
            "content": {
              "type": "string"
            },
            "timestamp": {
              "type": "string",
              "format": "date-time"
            },
            "type": {
              "type": "string",
              "enum": ["interaction", "narrative", "decision", "system"]
            },
            "relatedEntities": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": ["avatar", "item", "location"]
                  },
                  "id": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  }
                }
              }
            },
            "importance": {
              "type": "integer",
              "minimum": 1,
              "maximum": 10
            }
          }
        }
      }
    }
  };
}

export default router;
// OpenAPI specification for RATi API
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "RATi API",
    description: "API for managing avatars, items, and locations in the RATi ecosystem",
    version: "1.0.0"
  },
  servers: [
    {
      url: "/api",
      description: "API server"
    }
  ],
  paths: {
    "/avatars": {
      get: {
        summary: "Get all avatars",
        description: "Retrieve a list of all avatars",
        tags: ["Avatars"],
        responses: {
          "200": {
            description: "A list of avatars",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Avatar"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/avatars/{id}": {
      get: {
        summary: "Get avatar by ID",
        description: "Retrieve an avatar by its ID",
        tags: ["Avatars"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "The avatar ID"
          }
        ],
        responses: {
          "200": {
            description: "Avatar details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Avatar"
                }
              }
            }
          },
          "404": {
            description: "Avatar not found"
          }
        }
      }
    },
    "/avatars/{id}/memory": {
      get: {
        summary: "Get avatar memory",
        description: "Retrieve an avatar's memory records",
        tags: ["Avatars"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "The avatar ID"
          }
        ],
        responses: {
          "200": {
            description: "Avatar memory records",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Memory"
                  }
                }
              }
            }
          },
          "404": {
            description: "Avatar not found"
          }
        }
      }
    },
    "/items": {
      get: {
        summary: "Get all items",
        description: "Retrieve a list of all items",
        tags: ["Items"],
        responses: {
          "200": {
            description: "A list of items",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Item"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/items/{id}": {
      get: {
        summary: "Get item by ID",
        description: "Retrieve an item by its ID",
        tags: ["Items"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "The item ID"
          }
        ],
        responses: {
          "200": {
            description: "Item details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Item"
                }
              }
            }
          },
          "404": {
            description: "Item not found"
          }
        }
      }
    },
    "/locations": {
      get: {
        summary: "Get all locations",
        description: "Retrieve a list of all locations",
        tags: ["Locations"],
        responses: {
          "200": {
            description: "A list of locations",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Location"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/locations/{id}": {
      get: {
        summary: "Get location by ID",
        description: "Retrieve a location by its ID",
        tags: ["Locations"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "The location ID"
          }
        ],
        responses: {
          "200": {
            description: "Location details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Location"
                }
              }
            }
          },
          "404": {
            description: "Location not found"
          }
        }
      }
    },
    "/locations/{id}/avatars": {
      get: {
        summary: "Get avatars in location",
        description: "Retrieve all avatars present in a specific location",
        tags: ["Locations"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "The location ID"
          }
        ],
        responses: {
          "200": {
            description: "List of avatars in the location",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Avatar"
                  }
                }
              }
            }
          },
          "404": {
            description: "Location not found"
          }
        }
      }
    },
    "/chat": {
      post: {
        summary: "Chat with avatar",
        description: "Send a message to an avatar and get a response",
        tags: ["Chat"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["avatarId", "message"],
                properties: {
                  avatarId: {
                    type: "string",
                    description: "ID of the avatar to chat with"
                  },
                  message: {
                    type: "string",
                    description: "Message to send to the avatar"
                  },
                  locationId: {
                    type: "string",
                    description: "Optional location ID where the conversation is taking place"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Avatar response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    response: {
                      type: "string",
                      description: "Avatar's response to the message"
                    },
                    avatarId: {
                      type: "string",
                      description: "ID of the responding avatar"
                    },
                    avatarName: {
                      type: "string",
                      description: "Name of the responding avatar"
                    }
                  }
                }
              }
            }
          },
          "404": {
            description: "Avatar not found"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Avatar: {
        type: "object",
        required: ["tokenId", "name", "description", "attributes"],
        properties: {
          tokenId: {
            type: "string",
            description: "A unique identifier for the avatar NFT"
          },
          name: {
            type: "string",
            description: "The display name of the avatar"
          },
          description: {
            type: "string",
            description: "A narrative describing the avatar's origins, purpose, and role"
          },
          media: {
            type: "object",
            properties: {
              image: {
                type: "string",
                description: "URI for the avatar's image"
              },
              video: {
                type: "string",
                description: "URI for any associated video content"
              }
            }
          },
          attributes: {
            type: "array",
            description: "An array of traits that define the avatar's characteristics",
            items: {
              type: "object",
              properties: {
                trait_type: {
                  type: "string",
                  description: "The category of the trait (e.g., 'Personality', 'Role')"
                },
                value: {
                  type: "string",
                  description: "The value of the trait (e.g., 'Brave', 'Explorer')"
                }
              }
            }
          },
          evolution: {
            type: "object",
            properties: {
              level: {
                type: "integer",
                description: "The current evolution level of the avatar"
              },
              previous: {
                type: "array",
                description: "References to tokenIds of avatars burned to create this evolution",
                items: {
                  type: "string"
                }
              },
              timestamp: {
                type: "string",
                description: "ISO timestamp of the last evolution event"
              }
            }
          },
          memory: {
            type: "object",
            properties: {
              recent: {
                type: "string",
                description: "URI pointing to recent interactions and context"
              },
              archive: {
                type: "string",
                description: "URI pointing to the complete historical archive"
              }
            }
          }
        }
      },
      Item: {
        type: "object",
        required: ["tokenId", "name", "description", "attributes"],
        properties: {
          tokenId: {
            type: "string",
            description: "A unique identifier for the item NFT"
          },
          name: {
            type: "string",
            description: "The display name of the item"
          },
          description: {
            type: "string",
            description: "A narrative describing the item's origins, purpose, and role"
          },
          media: {
            type: "object",
            properties: {
              image: {
                type: "string",
                description: "URI for the item's image"
              },
              video: {
                type: "string",
                description: "URI for any associated video content"
              }
            }
          },
          attributes: {
            type: "array",
            description: "An array of traits that define the item's characteristics",
            items: {
              type: "object",
              properties: {
                trait_type: {
                  type: "string",
                  description: "The category of the trait (e.g., 'Rarity', 'Effect')"
                },
                value: {
                  type: "string",
                  description: "The value of the trait (e.g., 'Legendary', 'Portal Creation')"
                }
              }
            }
          },
          evolution: {
            type: "object",
            properties: {
              level: {
                type: "integer",
                description: "The current evolution level of the item"
              },
              previous: {
                type: "array",
                description: "References to tokenIds of items burned to create this evolution",
                items: {
                  type: "string"
                }
              },
              timestamp: {
                type: "string",
                description: "ISO timestamp of the last evolution event"
              }
            }
          }
        }
      },
      Location: {
        type: "object",
        required: ["tokenId", "name", "description", "attributes"],
        properties: {
          tokenId: {
            type: "string",
            description: "A unique identifier for the location NFT"
          },
          name: {
            type: "string",
            description: "The display name of the location"
          },
          description: {
            type: "string",
            description: "A narrative describing the location's origins, purpose, and role"
          },
          media: {
            type: "object",
            properties: {
              image: {
                type: "string",
                description: "URI for the location's image"
              },
              video: {
                type: "string",
                description: "URI for any associated video content"
              }
            }
          },
          attributes: {
            type: "array",
            description: "An array of traits that define the location's characteristics",
            items: {
              type: "object",
              properties: {
                trait_type: {
                  type: "string",
                  description: "The category of the trait (e.g., 'Region', 'Ambience')"
                },
                value: {
                  type: "string",
                  description: "The value of the trait (e.g., 'Moonstone Sanctum', 'Mystical')"
                }
              }
            }
          },
          currentAvatars: {
            type: "array",
            description: "List of avatar IDs currently in this location",
            items: {
              type: "string"
            }
          }
        }
      },
      Memory: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the memory record"
          },
          avatarId: {
            type: "string",
            description: "ID of the avatar this memory belongs to"
          },
          timestamp: {
            type: "string",
            description: "ISO timestamp when this memory was created"
          },
          content: {
            type: "string",
            description: "Content of the memory"
          },
          type: {
            type: "string",
            description: "Type of memory (e.g., 'interaction', 'observation', 'reflection')"
          },
          locationId: {
            type: "string",
            description: "ID of the location where this memory was formed (if applicable)"
          },
          relatedEntities: {
            type: "array",
            description: "Other entities (avatars, items) involved in this memory",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "ID of the related entity"
                },
                type: {
                  type: "string",
                  description: "Type of entity (avatar, item)"
                },
                role: {
                  type: "string",
                  description: "Role in the memory (e.g., 'participant', 'observer')"
                }
              }
            }
          }
        }
      }
    }
  }
};
