import { MongoClient, Db, Collection } from 'mongodb';

export interface MongoSensorData {
  _id: string;
  uuid: string;
  unixtime: number;
  [key: string]: any; // All sensor data is flexible - temperature, humidity, etc.
}

export class MongoDataService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<MongoSensorData> | null = null;

  private readonly connectionString: string;
  private readonly databaseName: string;
  private readonly collectionName: string;

  constructor(
    connectionString: string = process.env.MONGO_CONNECTION_STRING || '',
    databaseName: string = process.env.MONGO_DATABASE || 'dadosClima',
    collectionName: string = process.env.MONGO_COLLECTION || 'clima'
  ) {
    this.connectionString = connectionString;
    this.databaseName = databaseName;
    this.collectionName = collectionName;
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to MongoDB...');
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.collection = this.db.collection<MongoSensorData>(this.collectionName);
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
      console.log('Disconnected from MongoDB');
    }
  }

  async fetchAllData(): Promise<MongoSensorData[]> {
    if (!this.collection) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }

    try {
      console.log('Fetching all sensor data from MongoDB...');
      const data = await this.collection.find({}).toArray();
      console.log(`Found ${data.length} documents in MongoDB collection`);
      return data;
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      throw error;
    }
  }

  async fetchRecentData(limitCount: number = 10): Promise<MongoSensorData[]> {
    if (!this.collection) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }

    try {
      console.log(`Fetching ${limitCount} most recent sensor readings...`);
      const data = await this.collection
        .find({})
        .sort({ unixtime: -1 })
        .limit(limitCount)
        .toArray();
      console.log(`Found ${data.length} recent documents`);
      return data;
    } catch (error) {
      console.error('Error fetching recent data from MongoDB:', error);
      throw error;
    }
  }

  async fetchDataByStation(uuid: string): Promise<MongoSensorData[]> {
    if (!this.collection) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }

    try {
      console.log(`Fetching data for station: ${uuid}`);
      const data = await this.collection.find({ uuid }).toArray();
      console.log(`Found ${data.length} documents for station ${uuid}`);
      return data;
    } catch (error) {
      console.error(`Error fetching data for station ${uuid}:`, error);
      throw error;
    }
  }

  async fetchDataSinceTimestamp(sinceTimestamp: number): Promise<MongoSensorData[]> {
    if (!this.collection) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }

    try {
      console.log(`Fetching data since timestamp: ${sinceTimestamp} (${new Date(sinceTimestamp * 1000).toISOString()})`);
      const data = await this.collection
        .find({ unixtime: { $gt: sinceTimestamp } })
        .sort({ unixtime: 1 }) // Oldest first for processing
        .toArray();
      console.log(`Found ${data.length} new documents since last sync`);
      return data;
    } catch (error) {
      console.error('Error fetching data since timestamp:', error);
      throw error;
    }
  }

  async listCollections(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }

    try {
      console.log('Listing all collections in database...');
      const collections = await this.db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);
      console.log('Available collections:', collectionNames);
      return collectionNames;
    } catch (error) {
      console.error('Error listing collections:', error);
      throw error;
    }
  }

  async listDatabases(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }

    try {
      console.log('Listing all databases...');
      const databaseList = await this.client.db().admin().listDatabases();
      const databaseNames = databaseList.databases.map(db => db.name);
      console.log('Available databases:', databaseNames);
      return databaseNames;
    } catch (error) {
      console.error('Error listing databases:', error);
      throw error;
    }
  }

  logDataSample(data: MongoSensorData[], sampleSize: number = 3): void {
    console.log('\n=== SAMPLE DATA ===');
    const sample = data.slice(0, sampleSize);

    sample.forEach((doc, index) => {
      console.log(`\n--- Document ${index + 1} ---`);
      console.log('MongoDB ID:', doc._id);
      console.log('Station UUID:', doc.uuid);
      console.log('Unix Timestamp:', doc.unixtime);
      console.log('Human Date:', new Date(doc.unixtime * 1000).toISOString());

      // Log all sensor readings
      const sensorData: { [key: string]: any } = {};
      Object.keys(doc).forEach(key => {
        if (!['_id', 'uuid', 'unixtime'].includes(key)) {
          sensorData[key] = doc[key];
        }
      });

      if (Object.keys(sensorData).length > 0) {
        console.log('Sensor Data:', sensorData);
      }
    });

    console.log('\n=== END SAMPLE ===\n');
  }
}

// Helper function to test the MongoDB connection and data fetching
export async function testMongoConnection(): Promise<void> {
  const mongoService = new MongoDataService();

  try {
    // Connect to MongoDB
    await mongoService.connect();

    // List available databases and collections
    await mongoService.listDatabases();
    await mongoService.listCollections();

    // Fetch a small sample of recent data
    const recentData = await mongoService.fetchRecentData(5);

    if (recentData.length > 0) {
      mongoService.logDataSample(recentData);

      // Try to fetch data for a specific station if we found any
      const firstStation = recentData[0]?.uuid;
      if (firstStation) {
        const stationData = await mongoService.fetchDataByStation(firstStation);
        console.log(`Total readings for station ${firstStation}: ${stationData.length}`);
      }
    } else {
      console.log('No data found in the collection');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoService.disconnect();
  }
}