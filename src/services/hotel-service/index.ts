import { notFoundError, unauthorizedError } from '@/errors';
import hotelRepository from '@/repositories/hotel-repository';
import { Hotel, hotelWithRooms } from '@/protocols';
import bookinigRepositorie from '@/repositories/bookinig-repositorie';
import ticketsRepository from '@/repositories/tickets-repository';
import paymentsRepository from '@/repositories/payments-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { paymentRequiredError } from '@/errors/payment-required';
import { Booking, Enrollment, Payment, Ticket, TicketType } from '@prisma/client';
import { Room } from '@prisma/client';

async function getAllHotels(userId: number) : Promise<Hotel[]>{
    const isBooked = checkForUserBooking(userId);
    if(!isBooked) throw notFoundError;

    const isPaid = checkForuserTicketPayment(userId);
    if(!isPaid) throw paymentRequiredError();
    const hotels : Hotel[] = await hotelRepository.getAllHotels();
    return hotels;
}

async function getHotelRooms(hotelId : number, userId: number) : Promise<hotelWithRooms>{

  const hotelRoomsInfo :  (Room & {Hotel: Hotel})[] = await hotelRepository.getHotelRooms(hotelId);
  if (!hotelRoomsInfo) throw notFoundError();

  const hotelWithRooms = {

  }

  return ;
}

async function checkForUserBooking(userId: number) : Promise<Boolean>{
    const booking : Booking = await bookinigRepositorie.getUserBooking(userId);
    if(!booking) return false;

    return true
}

async function checkForuserTicketPayment(userId: number) : Promise<Boolean>{
    const enrollmentInfo : Enrollment= await enrollmentRepository.findWithAddressByUserId(userId);
    const ticket : Ticket & {TicketType : TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentInfo.id);
    if(!ticket) throw notFoundError();

    const payment : Payment = await paymentsRepository.findPaymentByTicketId(ticket.id);
    if(!payment) return false;

    return true
}


export default { getHotelRooms, getAllHotels };
