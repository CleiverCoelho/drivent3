import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotel-service';
import { Hotel } from '@prisma/client';
import { paymentRequiredError } from '@/errors/payment-required';
import { notFoundError } from '@/errors';

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
      const hotels : Hotel[] = await hotelService.getAllHotels(userId);
      // if(hotels.length === 0) throw notFoundError();
      // if(true) throw notFoundError();
      return res.status(httpStatus.OK).send(hotels);
    }
    catch(error) {
      if (error.name === 'NotFoundError') {
        return res.status(httpStatus.NOT_FOUND).send({
          message: error.message,
        });
      }
      if (error.name === 'UnauthorizedError') {
        return res.status(httpStatus.UNAUTHORIZED).send({
          message: error.message,
        });
      }
      if (error.name === 'PaymentRequired') {
        return res.status(httpStatus.PAYMENT_REQUIRED).send({
          message: error.message,
        });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId = parseInt(req.params.hotelId);
  try {
    if (!hotelId) return res.sendStatus(httpStatus.BAD_REQUEST);

    const hotel = await hotelService.getHotelRooms(hotelId, userId);
    // if(!hotel) throw notFoundError();
    return res.status(httpStatus.OK).send(hotel);
  } catch(error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send({
        message: error.message,
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(httpStatus.UNAUTHORIZED).send({
        message: error.message,
      });
    }
    if (error.name === 'PaymentRequired') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send({
        message: error.message,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}

