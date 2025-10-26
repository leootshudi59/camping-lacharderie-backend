import { Request, Response } from 'express';
import { PrismaEventRepository } from '../repositories/prisma/PrismaEventRepository';
import { EventService } from '../services/event.service';
import { CreateEventSchema } from '../dtos/create-event.dto';
import { UpdateEventSchema } from '../dtos/update-event.dto';

const repo = new PrismaEventRepository();
const service = new EventService(repo);

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export const getAllEvents = async (_: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log("\n=====  [ADMIN ONLY] getAllEvents  =====");
    const events = await service.findAll();
    res.status(200).json(events);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<any> => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  getEventById  =====");
      console.log("received event_id: " + req.params.event_id);
    }
    const event = await service.findById(req.params.event_id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log("\n=====  createEvent  =====", req.body);

    // Harmonisation image (optionnelle si champ vide)
    let reqBody = {
      title:       req.body.title,
      description: req.body.description,
      start_datetime:    req.body.start_datetime,
      end_datetime:      req.body.end_datetime,
      location:    req.body.location,
      image:       undefined as Buffer | undefined,
    };
    if (req.body.image !== '') {
      reqBody = { ...reqBody, image: req.body.image };
    }

    const dto = CreateEventSchema.parse(reqBody);
    const event = await service.create(dto);
    res.status(201).json(event);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  updateEvent  =====", req.params.event_id, req.body);
    }
    const dto = UpdateEventSchema.parse({ ...req.body, event_id: req.params.event_id });
    const event = await service.update(dto);
    res.status(200).json(event);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  deleteEvent  =====");
      console.log("received event_id: " + req.params.event_id);
    }
    await service.delete(req.params.event_id);
    res.status(204).send();
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};