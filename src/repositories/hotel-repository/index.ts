import { prisma } from '@/config';

async function getAllHotels() {
  return prisma.hotel.findMany({});
}

async function getHotelRooms(hotelId: number) {
  return prisma.room.findMany({
    where : {
        id: hotelId
    },
    include: {
        Hotel: true
    }
  });
}


export default { getAllHotels, getHotelRooms };
