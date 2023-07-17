import { notFoundError, paymentRequiredError } from "@/errors";
import paymentsRepository from "@/repositories/payments-repository";
import { AuthenticatedRequest, NextFunction } from "./authentication-middleware";
import { Payment, Ticket, Enrollment, TicketType } from "@prisma/client";
import enrollmentRepository from "@/repositories/enrollment-repository";
import httpStatus from "http-status";
import ticketsRepository from "@/repositories/tickets-repository";

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = req.userId;
  
    try {
        const enrollmentInfo : Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
        if(!enrollmentInfo) throw notFoundError();
        
        const ticket : Ticket & {TicketType : TicketType} = await ticketsRepository.findTicketByEnrollmentId(enrollmentInfo.id);
        if(!ticket) throw notFoundError();
        if(ticket.TicketType.isRemote) throw paymentRequiredError();
        if(!ticket.TicketType.includesHotel) throw paymentRequiredError();
      
        const payment : Payment = await paymentsRepository.findPaymentByTicketId(ticket.id);
        if(!payment) throw paymentRequiredError();
  
      return next();
    } catch (error) {
        // if (error.name === 'NotFoundError') {
        //     return res.sendStatus(httpStatus.NOT_FOUND);
        //   }
        //   if (error.name === 'UnauthorizedError') {
        //     return res.status(httpStatus.UNAUTHORIZED).send({
        //       message: error.message,
        //     });
        //   }
        //   if (error.name === 'PaymentRequired') {
        //     return res.status(httpStatus.PAYMENT_REQUIRED).send({
        //       message: error.message,
        //     });
        //   }
        //   return res.status(httpStatus.BAD_REQUEST).send(error);    
    }
  }