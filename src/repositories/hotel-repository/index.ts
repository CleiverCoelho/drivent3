import { prisma } from '@/config';

async function getAllHotels() {
  return prisma.hotel.findMany();
}

async function getHotelRooms(hotelId: number) {
  return prisma.hotel.findFirst({
    where : {
        id: hotelId
    }, include : {
      Rooms : true
    }
  });
}


export default { getAllHotels, getHotelRooms };
