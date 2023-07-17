import supertest from "supertest";
import app from "@/app";
import {prisma} from "@/config/database";
import { cleanDb } from "../helpers";
import { CreateHotel } from "@/protocols";
import { buildHotel } from "../factories/hotel-factory";

const api = supertest(app);

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
})

describe("GET /hotels", () => {
  it("should get all hotels list and return 200", async () => {

    const { body, status } = await api.get("/hotels");
    expect(status).toBe(200);
    expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(Number),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          })
        ])
      )
  });

  it("should return 422 when body is incomplete", async () => {
    const { status } = await api.post("/fruits").send({ name: "orange" });
    expect(status).toBe(422);
  });

  it("should return 409 when trying to insert the same fruit twice", async () => {
    const fruit = await buildFruit();

    const { status: newStatus } = await api.post("/fruits").send({
      name: fruit.name,
      price: 12890
    });
    expect(newStatus).toBe(409);
  });

});
