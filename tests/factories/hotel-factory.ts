import {prisma} from "@/config";
import { CreateHotel } from '@/protocols';

export async function buildHotel(hotelObj : CreateHotel) {
    return await prisma.hotel.create({
        data: hotelObj
    });
}
