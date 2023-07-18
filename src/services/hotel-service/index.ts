import { notFoundError, unauthorizedError } from '@/errors';
import hotelRepository from '@/repositories/hotel-repository';
import { HotelWithRooms, RoomResponse } from '@/protocols';
import bookinigRepositorie from '@/repositories/bookinig-repositorie';
import ticketsRepository from '@/repositories/tickets-repository';
import paymentsRepository from '@/repositories/payments-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { paymentRequiredError } from '@/errors/payment-required';
import { Booking, Enrollment, Payment, Ticket, TicketType } from '@prisma/client';
import { Room, Hotel } from '@prisma/client';
import { parse } from 'path';

async function getAllHotels(userId: number) : Promise<Hotel[]>{
  const enrollmentInfo : Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollmentInfo) throw notFoundError();
  
  const ticket : Ticket & {TicketType : TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentInfo.id);
  if(!ticket) throw notFoundError();
  if(ticket.TicketType.isRemote) throw paymentRequiredError();
  if(!ticket.TicketType.includesHotel) throw paymentRequiredError();
  if(ticket.status !== 'PAID') throw paymentRequiredError();

  const hotels : Hotel[] = await hotelRepository.getAllHotels();
  if(!hotels[0] || hotels.length === 0 || hotels === undefined) throw notFoundError();

  return hotels;
}

async function getHotelRooms(hotelId : number, userId: number){

  const enrollmentInfo : Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollmentInfo) throw notFoundError();
  
  const ticket : Ticket & {TicketType : TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentInfo.id);
  if(!ticket) throw notFoundError();
  if(ticket.TicketType.isRemote) throw paymentRequiredError();
  if(!ticket.TicketType.includesHotel) throw paymentRequiredError();
  if(ticket.status !== 'PAID') throw paymentRequiredError();

  const rooms = await hotelRepository.getHotelRooms(hotelId);

  if(!rooms || rooms === undefined) throw notFoundError();
  return rooms;
}

export default { getHotelRooms, getAllHotels };
