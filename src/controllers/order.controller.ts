import { Request, Response } from 'express';
import { CreateOrderSchema } from '../dtos/create-order.dto';
import { UpdateOrderSchema } from '../dtos/update-order.dto';
import { OrderService } from '../services/order.service';
import { PrismaOrderRepository } from '../repositories/prisma/PrismaOrderRepository';

const service = new OrderService(new PrismaOrderRepository());
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export const getAllOrders = async (_: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== [ADMIN] getAllOrders =====');
    const list = await service.findAll();
    res.status(200).json(list);
  } catch (e: any) {
    DEBUG_MODE && console.error(e);
    res.status(400).json({ error: e.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<any> => {
  try {
    const order_id = req.params.order_id;
    if (DEBUG_MODE) console.log('\n===== getOrderById =====', order_id);
    const ord = await service.findById(order_id);
    if (!ord) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(ord);
  } catch (e: any) {
    DEBUG_MODE && console.error(e);
    res.status(400).json({ error: e.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== createOrder =====', req.body);

    const dto = CreateOrderSchema.parse({
      booking_id: req.body.booking_id,
      status: req.body.status, // optionnel
      items: req.body.items,   // [{ product_id, quantity }]
    });

    const created = await service.create(dto);
    res.status(201).json(created);
  } catch (e: any) {
    DEBUG_MODE && console.error(e);
    res.status(400).json({ error: e.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== updateOrder =====', req.params.order_id, req.body);

    const dto = UpdateOrderSchema.parse({
      order_id: req.params.order_id,
      booking_id: req.body.booking_id,
      status: req.body.status,
      items: req.body.items, // si présent: remplace la liste
    });

    const updated = await service.update(dto);
    res.status(200).json(updated);
  } catch (e: any) {
    DEBUG_MODE && console.error(e);
    res.status(400).json({ error: e.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== [ADMIN] deleteOrder =====', req.params.order_id);
    await service.delete(req.params.order_id);
    res.status(204).send();
  } catch (e: any) {
    DEBUG_MODE && console.error(e);
    res.status(400).json({ error: e.message });
  }
};