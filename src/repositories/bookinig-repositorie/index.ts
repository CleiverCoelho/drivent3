import { prisma } from '@/config';
import { Booking } from '@prisma/client';

async function getUserBooking(userId: number) : Promise<Booking>{
  return prisma.booking.findFirst({where: {id: userId}});
}


export default { getUserBooking };