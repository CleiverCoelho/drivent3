import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken } from "../helpers";
import { buildHotel } from "../factories/hotel-factory";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser, ticketHotelTrue, ticketRemote, ticketWithoutHotel } from "../factories";
import { TicketStatus } from "@prisma/client";
import { prisma } from "@/config";

const server = supertest(app);

beforeAll(async () => {
    cleanDb();  
    buildHotel({
        name: "aaaaaaaaaa",
        image: "bbbbbbbbbbb",
        createdAt: new Date(),
        updatedAt: new Date()
    })
    buildHotel({
        name: "cccccccccc",
        image: "ddddddddddddd",
        createdAt: new Date(),
        updatedAt: new Date()
    })
})

beforeEach(async () => {
  await prisma.booking.deleteMany();
  cleanDb(); 
})

describe('GET /hotels with valid token', () => {

    it('should return 404 if there is no subscription', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should return 404 if there is no ticket ', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should return 404 if there is no hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should return 402 if ticket is unpaid', async () => {
        
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const newTicketType = await createTicketType();
        const newTicket = await createTicket(enrollmentUser.id ,newTicketType.id, TicketStatus.RESERVED);
        

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        
    });

    it('should return 402 if ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const newTicket = await ticketRemote();
        const ticket = await createTicket(enrollmentUser.id ,newTicket.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        
    });

    it('should return 402 if ticket does not include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const newTicket = await ticketWithoutHotel();
        const ticket = await createTicket(enrollmentUser.id ,newTicket.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        
    });

    it('should return 200 with all hotels', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const newTicketType = await ticketHotelTrue();
        const newTicket = await createTicket(enrollmentUser.id ,newTicketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.OK);
    });
})

