import { Request, Response } from 'express';
import { PrismaInventoryRepository } from '../repositories/prisma/PrismaInventoryRepository';
import { InventoryService } from '../services/inventory.service';
import { CreateInventorySchema } from '../dtos/create-inventory.dto';
import { UpdateInventorySchema } from '../dtos/update-inventory.dto';

const repo = new PrismaInventoryRepository();
const service = new InventoryService(repo);
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export const getAllInventories = async (_: Request, res: Response) => {
  try {
    const inventories = await service.findAll();
    res.status(200).json(inventories);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getInventoryById = async (req: Request, res: Response): Promise<any> => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  getInventoryById  =====");
      console.log("received params: ", req.params);
    }
    const inv = await service.findById(req.params.inventory_id);
    if (!inv) return res.status(404).json({ message: 'Inventory not found' });
    res.status(200).json(inv);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const createInventory = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  createInventory  =====");
      console.log("received body: ", req.body);
      console.log("received params: ", req.params);
    }

    // if we are on route /bookings/:booking_id/inventories
    // we need to merge booking_id from params with body
    const merged = {
      ...req.body,
      ...(req.params.booking_id ? { booking_id: req.params.booking_id } : {}),
    };

    // if user is guest, we need to remove campsite_id from merged to prevent guest from creating an inventory for a campsite
    if ((req as any).guest) {
      delete (merged as any).campsite_id;
    }
    const dto = CreateInventorySchema.parse(merged);
    const inv = await service.create(dto);
    res.status(201).json(inv);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  updateInventory  =====");
      console.log("received inventory_id: " + req.params.inventory_id);
      console.log("received body: ", req.body);
    }
    const dto = UpdateInventorySchema.parse({ ...req.body, inventory_id: req.params.inventory_id });
    const inv = await service.update(dto);
    res.status(200).json(inv);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
        console.log("\n=====  deleteInventory  =====");
        console.log("received inventory_id: " + req.params.inventory_id);
    }

    await service.delete(req.params.inventory_id);
    res.status(204).send();
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};