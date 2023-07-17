import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getAllHotels, getHotelRooms } from '@/controllers/hotel-controller';

const hotelRouter = Router();

hotelRouter
  .all('/*', authenticateToken)
  .get('/', getAllHotels)
  .get('/:hotelId', getHotelRooms);

export { hotelRouter };
