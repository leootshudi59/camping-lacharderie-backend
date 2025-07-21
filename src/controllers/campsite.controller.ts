import { Request, Response } from 'express';
import { PrismaCampsiteRepository } from '../repositories/prisma/PrismaCampsiteRepository';
import { CampsiteService } from '../services/campsite.service';
import { CreateCampsiteSchema } from '../dtos/create-campsite.dto';
import { UpdateCampsiteSchema } from '../dtos/update-campsite.dto';

const repo = new PrismaCampsiteRepository();
const service = new CampsiteService(repo);

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export const getAllCampsites = async (_: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  [ADMIN ONLY] getAllCampsites  =====");
    }

    const campsites = await service.findAll();
    res.status(200).json(campsites);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getCampsiteById = async (req: Request, res: Response): Promise<any> => {
  try {
    if (DEBUG_MODE) console.log("\n=====  getCampsiteById  =====", req.params.campsite_id);
    const campsite = await service.findById(req.params.campsite_id);
    if (!campsite) return res.status(404).json({ message: 'Campsite not found' });
    res.status(200).json(campsite);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const createCampsite = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  createCampsite  =====", req.body);
    }
    let reqBody = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      status: req.body.status,
      image: undefined
    }
    if (req.body.image !== '') {
      reqBody = { ...reqBody, image: req.body.image}
    }
    
    const dto = CreateCampsiteSchema.parse(reqBody);
    const campsite = await service.create(dto);
    res.status(201).json(campsite);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateCampsite = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  updateCampsite  =====", req.params.campsite_id, req.body);
    }
    
    const dto = UpdateCampsiteSchema.parse({ ...req.body, campsite_id: req.params.campsite_id });
    const campsite = await service.update(dto);
    res.status(200).json(campsite);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteCampsite = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  deleteCampsite  =====");
      console.log("received campsite_id: " + req.params.campsite_id);
    }

    await service.delete(req.params.campsite_id);
    res.status(204).send();
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};