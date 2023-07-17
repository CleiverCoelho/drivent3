import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotel-service';
import { Hotel } from '@prisma/client';
import { paymentRequiredError } from '@/errors/payment-required';

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
      const hotels : Hotel[] = await hotelService.getAllHotels(userId);

      return res.status(httpStatus.OK).send(hotels);
    }
    catch(error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    }
    
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId = parseInt(req.params.hotelId);
  try {
    if (!hotelId) return res.sendStatus(httpStatus.BAD_REQUEST);

    const payment = await hotelService.getHotelRooms(hotelId, userId);
    if (!payment) throw paymentRequiredError();
  
    return res.status(httpStatus.OK).send(payment);
  }
  catch(error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}
