import os
import logging
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from dotenv import load_dotenv

load_dotenv()

# Reduce verbosity of Azure SDK logs
logging.getLogger('azure').setLevel(logging.WARNING)
logging.getLogger('azure.cosmos').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# Cosmos DB Configuration
ENDPOINT = os.getenv("COSMOS_ENDPOINT")
KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = os.getenv("COSMOS_DATABASE", "ZovidaDB")

# Container Names
CONTAINER_PASSPORT = os.getenv("COSMOS_CONTAINER_PASSPORT", "SafetyPassports")
CONTAINER_INTERACTIONS = os.getenv("COSMOS_CONTAINER_INTERACTIONS", "AnonymizedInteractions")
CONTAINER_SESSIONS = os.getenv("COSMOS_CONTAINER_SESSIONS", "UserSessions")

class CosmosDBService:
    def __init__(self):
        self.client = None
        self.database = None
        self.containers = {}
        self.initialized = False
        self.failed_once = False # Prevent constant retry spam
        
    def _initialize(self):
        if self.initialized:
            return True
            
        # Remove failed_once check to allow retry with new endpoint
        self.failed_once = False 

        endpoint = os.getenv("COSMOS_ENDPOINT")
        key = os.getenv("COSMOS_KEY")
        
        if endpoint and key:
            try:
                # Set a strict timeout to avoid hanging the request
                self.client = CosmosClient(endpoint, key, connection_timeout=2, request_timeout=2)
                self.database = self.client.create_database_if_not_exists(id=DATABASE_NAME)
                
                # Initialize containers
                for container_id in [CONTAINER_PASSPORT, CONTAINER_INTERACTIONS, CONTAINER_SESSIONS]:
                    self.containers[container_id] = self.database.create_container_if_not_exists(
                        id=container_id,
                        partition_key=PartitionKey(path="/id")
                    )
                self.initialized = True
                logger.info("✅ Azure Cosmos DB Service Initialized")
                return True
            except Exception as e:
                self.failed_once = True
                logger.error(f"❌ Cosmos DB Connection Failed: {str(e)}")
                logger.info("ℹ️ Zovida will continue using local SQLite storage.")
                return False
        return False

    def save_item(self, container_id, item):
        """Save or update an item in a specific container"""
        if not self.initialized:
            if not self._initialize():
                return None
                
        if container_id not in self.containers:
            return None
            
        try:
            container = self.containers[container_id]
            return container.upsert_item(item)
        except Exception as e:
            logger.error(f"❌ Error saving to Cosmos DB ({container_id}): {str(e)}")
            return None

    def get_item(self, container_id, item_id):
        """Retrieve an item by its ID"""
        if not self.initialized:
            if not self._initialize():
                return None
                
        if container_id not in self.containers:
            return None
            
        try:
            container = self.containers[container_id]
            return container.read_item(item=item_id, partition_key=item_id)
        except exceptions.CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"❌ Error reading from Cosmos DB ({container_id}): {str(e)}")
            return None

    def query_items(self, container_id, query, parameters=None):
        """Query items in a container"""
        if not self.initialized:
            if not self._initialize():
                return []
                
        if container_id not in self.containers:
            return []
            
        try:
            container = self.containers[container_id]
            items = container.query_items(
                query=query,
                parameters=parameters,
                enable_cross_partition_query=True
            )
            return list(items)
        except Exception as e:
            logger.error(f"❌ Error querying Cosmos DB ({container_id}): {str(e)}")
            return []

# Singleton instance
cosmos_service = CosmosDBService()
# Note: Initial initialization at import is removed to prevent startup blockers. 
# It will initialize on first use.
