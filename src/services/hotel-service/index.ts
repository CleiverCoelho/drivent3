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

async function getAllHotels(userId: number) : Promise<Hotel[]>{
  const enrollmentInfo : Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollmentInfo) throw notFoundError();
  
  const ticket : Ticket & {TicketType : TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentInfo.id);
  if(!ticket) throw notFoundError();
  if(ticket.TicketType.isRemote) throw paymentRequiredError();
  if(!ticket.TicketType.includesHotel) throw paymentRequiredError();  
  if(ticket.status === 'RESERVED') throw paymentRequiredError();

  const hotels : Hotel[] = await hotelRepository.getAllHotels();
  if(!hotels || hotels.length === 0 || hotels === undefined) throw notFoundError();
  return hotels;
}

async function getHotelRooms(hotelId : number, userId: number) : Promise<HotelWithRooms>{

  const rooms :  Room[] = await hotelRepository.getHotelRooms(hotelId);
  const parsedRooms : RoomResponse[] = rooms.map((room) : RoomResponse => {
    return {
        ...room, createdAt: room.createdAt.toISOString(), updatedAt: room.updatedAt.toISOString()
    }
  })
  const enrollmentInfo : Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollmentInfo) throw notFoundError();
  
  const ticket : Ticket & {TicketType : TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentInfo.id);
  if(!ticket) throw notFoundError();
  if(ticket.TicketType.isRemote) throw paymentRequiredError();
  if(!ticket.TicketType.includesHotel) throw paymentRequiredError();
  if(ticket.status === 'RESERVED') throw paymentRequiredError();

  const hotel : Hotel = await hotelRepository.getHotelById(hotelId);
  if(!hotel) throw notFoundError();

  const hotelWithRooms : HotelWithRooms = {
    id: hotel.id,
    name: hotel.name,
    image: hotel.image,
    createdAt: hotel.createdAt.toISOString(),
    updatedAt: hotel.updatedAt.toISOString(),
    Rooms : parsedRooms
  }
  return hotelWithRooms;
}

export default { getHotelRooms, getAllHotels };
