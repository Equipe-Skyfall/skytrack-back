import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import {
  IStation,
  ICreateStationDTO,
  IUpdateStationDTO,
  IStationQueryParams,
  StationStatus,
} from '../types/station';
import { IDatabaseConnection } from '../config/database';
import { stationFactory } from '../factories/stationFactory';

// Repository interface following Dependency Inversion Principle
export interface IStationRepository {
  findAll(queryParams?: IStationQueryParams): Promise<IStation[]>;
  findById(id: string): Promise<IStation | null>;
  create(stationData: ICreateStationDTO): Promise<IStation>;
  update(id: string, stationData: IUpdateStationDTO): Promise<IStation | null>;
  delete(id: string): Promise<boolean>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
  count(queryParams?: IStationQueryParams): Promise<number>;
}

// Station Repository implementation following Repository Pattern
export class StationRepository implements IStationRepository {
  constructor(private databaseConnection: IDatabaseConnection) {}

  private get pool(): Pool {
    return this.databaseConnection.getPool();
  }

  async findAll(queryParams?: IStationQueryParams): Promise<IStation[]> {
    let query = 'SELECT * FROM meteorological_stations WHERE 1=1';
    const values: any[] = [];
    let valueIndex = 1;

    // Build dynamic query based on parameters
    if (queryParams?.name) {
      query += ` AND name ILIKE $${valueIndex}`;
      values.push(`%${queryParams.name}%`);
      valueIndex++;
    }

    if (queryParams?.status) {
      query += ` AND status = $${valueIndex}`;
      values.push(queryParams.status);
      valueIndex++;
    }

    if (queryParams?.minLatitude !== undefined) {
      query += ` AND latitude >= $${valueIndex}`;
      values.push(queryParams.minLatitude);
      valueIndex++;
    }

    if (queryParams?.maxLatitude !== undefined) {
      query += ` AND latitude <= $${valueIndex}`;
      values.push(queryParams.maxLatitude);
      valueIndex++;
    }

    if (queryParams?.minLongitude !== undefined) {
      query += ` AND longitude >= $${valueIndex}`;
      values.push(queryParams.minLongitude);
      valueIndex++;
    }

    if (queryParams?.maxLongitude !== undefined) {
      query += ` AND longitude <= $${valueIndex}`;
      values.push(queryParams.maxLongitude);
      valueIndex++;
    }

    // Add ordering
    query += ' ORDER BY created_at DESC';

    // Add pagination
    if (queryParams?.limit) {
      query += ` LIMIT $${valueIndex}`;
      values.push(queryParams.limit);
      valueIndex++;
    }

    if (queryParams?.offset) {
      query += ` OFFSET $${valueIndex}`;
      values.push(queryParams.offset);
    }

    const result = await this.pool.query(query, values);
    return result.rows.map(row => stationFactory.createStationFromData(row));
  }

  async findById(id: string): Promise<IStation | null> {
    const query = 'SELECT * FROM meteorological_stations WHERE id = $1';
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return stationFactory.createStationFromData(result.rows[0]);
  }

  async create(stationData: ICreateStationDTO): Promise<IStation> {
    const id = randomUUID();
    const now = new Date();
    const status = stationData.status || StationStatus.ACTIVE;

    const query = `
      INSERT INTO meteorological_stations
      (id, name, latitude, longitude, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      id,
      stationData.name.trim(),
      stationData.latitude,
      stationData.longitude,
      stationData.description?.trim() || null,
      status,
      now,
      now,
    ];

    const result = await this.pool.query(query, values);
    return stationFactory.createStationFromData(result.rows[0]);
  }

  async update(id: string, stationData: IUpdateStationDTO): Promise<IStation | null> {
    // First check if station exists
    const existingStation = await this.findById(id);
    if (!existingStation) {
      return null;
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Build dynamic update query
    if (stationData.name !== undefined) {
      updateFields.push(`name = $${valueIndex}`);
      values.push(stationData.name.trim());
      valueIndex++;
    }

    if (stationData.latitude !== undefined) {
      updateFields.push(`latitude = $${valueIndex}`);
      values.push(stationData.latitude);
      valueIndex++;
    }

    if (stationData.longitude !== undefined) {
      updateFields.push(`longitude = $${valueIndex}`);
      values.push(stationData.longitude);
      valueIndex++;
    }

    if (stationData.description !== undefined) {
      updateFields.push(`description = $${valueIndex}`);
      values.push(stationData.description?.trim() || null);
      valueIndex++;
    }

    if (stationData.status !== undefined) {
      updateFields.push(`status = $${valueIndex}`);
      values.push(stationData.status);
      valueIndex++;
    }

    if (updateFields.length === 0) {
      return existingStation; // No changes to make
    }

    // Add updated_at field
    updateFields.push(`updated_at = $${valueIndex}`);
    values.push(new Date());
    valueIndex++;

    // Add ID for WHERE clause
    values.push(id);

    const query = `
      UPDATE meteorological_stations
      SET ${updateFields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return stationFactory.createStationFromData(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM meteorological_stations WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    let query = 'SELECT id FROM meteorological_stations WHERE name = $1';
    const values: any[] = [name.trim()];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await this.pool.query(query, values);
    return result.rows.length > 0;
  }

  async count(queryParams?: IStationQueryParams): Promise<number> {
    let query = 'SELECT COUNT(*) as total FROM meteorological_stations WHERE 1=1';
    const values: any[] = [];
    let valueIndex = 1;

    // Apply same filters as findAll but for count
    if (queryParams?.name) {
      query += ` AND name ILIKE $${valueIndex}`;
      values.push(`%${queryParams.name}%`);
      valueIndex++;
    }

    if (queryParams?.status) {
      query += ` AND status = $${valueIndex}`;
      values.push(queryParams.status);
      valueIndex++;
    }

    if (queryParams?.minLatitude !== undefined) {
      query += ` AND latitude >= $${valueIndex}`;
      values.push(queryParams.minLatitude);
      valueIndex++;
    }

    if (queryParams?.maxLatitude !== undefined) {
      query += ` AND latitude <= $${valueIndex}`;
      values.push(queryParams.maxLatitude);
      valueIndex++;
    }

    if (queryParams?.minLongitude !== undefined) {
      query += ` AND longitude >= $${valueIndex}`;
      values.push(queryParams.minLongitude);
      valueIndex++;
    }

    if (queryParams?.maxLongitude !== undefined) {
      query += ` AND longitude <= $${valueIndex}`;
      values.push(queryParams.maxLongitude);
    }

    const result = await this.pool.query(query, values);
    return parseInt(result.rows[0].total);
  }


  // Initialize database table (for development purposes)
  async initializeTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS meteorological_stations (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name)
      );
    `;

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_meteorological_stations_status ON meteorological_stations(status);
      CREATE INDEX IF NOT EXISTS idx_meteorological_stations_coordinates ON meteorological_stations(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_meteorological_stations_name ON meteorological_stations(name);
    `;

    await this.pool.query(createTableQuery);
    await this.pool.query(createIndexQuery);
  }
}

