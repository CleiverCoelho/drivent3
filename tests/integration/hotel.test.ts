import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken } from "../helpers";
import { buildHotel } from "../factories/hotel-factory";
import { createEnrollmentWithAddress, createTicket, createHotels, createTicketType, createUser, buildPresencialTicketWithouHotel, buildTicketWithHotel, buildRemoteTicketWithouHotel, createPayment, createTicketTypeForHotel } from "../factories";
import { TicketStatus } from "@prisma/client";
import * as jwt from 'jsonwebtoken';

const server = supertest(app);

beforeAll(async ()=> {
    await init();
})

beforeEach(async ()=> {
    await cleanDb();
});

describe('GET /hotels when token is valid', () => {
        it('should respond with status 404 when enrollment does not exist', async () => {
            const token = await generateValidToken();

            const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(status).toEqual(httpStatus.NOT_FOUND);
        });

    it('should respond with status 404 when ticket does not exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);

        const hotel = await createHotels();
        const {status, body} = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when does not exist any hotels', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const {status, body} = await server.get(`/hotels`).set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when ticket is not paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);

        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

    });

    // it('should respond with status 200 when there is hotels available', async () => {
    //     const user = await createUser();
    //     const token = await generateValidToken(user);
    //     const enrollment = await createEnrollmentWithAddress(user);
    //     const isRemote = false;
    //     const includesHotel = true;
    //     const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);

    //     const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    //     await createHotels();
    //     const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        
    //     const payment = await createPayment(ticket.id, ticketType.price);

    //     expect(status).toEqual(httpStatus.OK);
    //     expect(body).toEqual(
    //         expect.arrayContaining([
    //             expect.objectContaining({
    //                 id: expect.any(Number),
    //                 name: expect.any(String),
    //                 image: expect.any(String),
    //                 createdAt: expect.any(String),
    //                 updatedAt: expect.any(String)
    //             })
    //         ])
    //     )

    // });

    it('should respond with status 402 when ticket type is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = true;
        const includesHotel = false;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        await createPayment(ticket.id, ticketType.price);
    
        const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when ticket do not includes a hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = true;
        const includesHotel = false;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        await createPayment(ticket.id, ticketType.price);
    
        const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond status 200 and body with hotels',async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        await createPayment(ticket.id, ticketType.price);

        await createHotels();
    
        const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(status).toEqual(httpStatus.OK);
        
    });
});

describe('GET /hotels when token is not valid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const {status} = await server.get('/tickets/types');
  
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
});

describe('GET /hotels/:hotelId when token is valid', () => {
      
    it('should respond with status 404 when hotel does not exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        await createPayment(ticket.id, ticketType.price);

        const {status, body} = await server.get('/hotels/100000').set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when ticket type is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = true;
        const includesHotel = false;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        await createPayment(ticket.id, ticketType.price);
    
        const hotel = await createHotels();
        const {status, body} = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when ticket is not paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);

        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        
        const hotel = await createHotels();
        const {status, body} = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);

    });

    it('should respond with status 404 when ticket does not exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);

        const {status, body} = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.NOT_FOUND);
    });

});

describe('GET /hotels/:hotelId when token is invalid', () => {
      
    it('should respond with status 401 if there is no session for given token', async () => {
        const user = await createUser();
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        await createPayment(ticket.id, ticketType.price);

        await createHotels();

        const {status, body} = await server.get('/hotels/5').set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 402 when ticket do not includes a hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = true;
        const includesHotel = false;
        const ticketType = await createTicketTypeForHotel(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        await createPayment(ticket.id, ticketType.price);
    
        await createHotels();

        const {status, body} = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

        expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/hotels/:hotelId').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
});