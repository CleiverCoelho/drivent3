import { prisma } from '@/config';

async function getAllHotels() {
  return prisma.hotel.findMany({});
}

async function getHotelRooms(hotelId: number) {
  return prisma.room.findMany({
    where : {
        id: hotelId
    }
  });
}

async function getHotelById(hotelId: number) {
    return prisma.hotel.findFirst({where: {
        id: hotelId
    }})
}


export default { getAllHotels, getHotelRooms, getHotelById };
