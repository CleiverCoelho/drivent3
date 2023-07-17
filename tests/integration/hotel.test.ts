import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken } from "../helpers";
import { buildHotel } from "../factories/hotel-factory";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser, buildPresencialTicketWithouHotel, buildTicketWithHotel, buildRemoteTicketWithouHotel } from "../factories";
import { TicketStatus } from "@prisma/client";
import { prisma } from "@/config";
import { build } from "joi";

const server = supertest(app);

beforeAll(async ()=> {
    await init();
})

beforeEach(async ()=> {
    await cleanDb();
    buildHotel();
    buildHotel();
});

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
        
        await createTicket(enrollmentUser.id ,newTicketType.id, TicketStatus.RESERVED);
        
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        
    });

    it('should return 402 if ticket is remote without hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const newTicket = await buildRemoteTicketWithouHotel();
        
        await createTicket(enrollmentUser.id, newTicket.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        
    });

    it('should return 402 if ticket is not remote and does not include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const newTicket = await buildPresencialTicketWithouHotel();
        
        await createTicket(enrollmentUser.id ,newTicket.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        
    });

    it('should return 200 with all hotels', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const newTicketType = await buildPresencialTicketWithouHotel();
    
        await createTicket(enrollmentUser.id ,newTicketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.OK);
    });
})

