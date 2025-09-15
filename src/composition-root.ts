import { prismaConnection } from './config/prisma';
import { StationRepository, IStationRepository } from './repositories/stationRepository';
import { StationService } from './services/stationService';
import { StationController } from './controllers/stationController';
import { IStationService } from './services/stationService';
import { IStationController } from './controllers/stationController';

// Composition Root - Single place for dependency wiring
export interface IDependencies {
  stationController: IStationController;
  stationService: IStationService;
  stationRepository: IStationRepository;
}

export async function createDependencies(): Promise<IDependencies> {
  try {
    // Initialize database connection
    await prismaConnection.connect();

    // Create dependencies in order (bottom-up)
    const prismaClient = prismaConnection.getClient();
    const stationRepository = new StationRepository(prismaClient);
    const stationService = new StationService(stationRepository);
    const stationController = new StationController(stationService);

    console.log('✅ Dependencies wired successfully');

    return {
      stationController,
      stationService,
      stationRepository,
    };
  } catch (error) {
    console.error('❌ Dependency wiring failed:', error);
    throw error;
  }
}

// Cleanup function
export async function cleanupDependencies(): Promise<void> {
  try {
    await prismaConnection.disconnect();
    console.log('🔌 Dependencies cleaned up successfully');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}