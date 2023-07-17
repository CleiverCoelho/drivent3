import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function buildHotel(){
    return prisma.hotel.create({
        data: {
            createdAt: "2023-07-17T13:36:20.552Z",
            name: faker.name.findName(),
            image: faker.image.city(),
            updatedAt: "2023-07-15T00:05:42.087Z"
        }
    })
}

export async function buildRoom(id: number){
    return prisma.room.create({
        data: {
            name: faker.name.findName(),
            capacity: 5,
            hotelId: 1
        }
    })
}

export async function createHotels() {
    return prisma.hotel.create({
        data: {
        name: faker.company.companyName(),
        image: faker.image.business(),
        Rooms: {
            createMany: {
            data: [
                {
                name: faker.word.noun(),
                capacity: faker.datatype.number({ min: 1, max: 4 }),
                }
            ]
            }
        }
        },
        include: { Rooms: true },
    });
}