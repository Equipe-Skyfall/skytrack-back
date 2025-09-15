import { Router } from 'express';
import healthRoutes from './healthRoutes';
import createStationRoutes from './stationRoutes';
import { IDependencies } from '../composition-root';

const createRoutes = (dependencies: IDependencies): Router => {
  const router = Router();

  router.use(healthRoutes);
  router.use(createStationRoutes(dependencies.stationController));

  return router;
};

export default createRoutes;