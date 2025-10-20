import { Request, Response } from 'express';
import { PrismaProductRepository } from '../repositories/prisma/PrismaProductRepository';
import { ProductService } from '../services/product.service';
import { CreateProductSchema } from '../dtos/create-product.dto';
import { UpdateProductSchema } from '../dtos/update-product.dto';

const service = new ProductService(new PrismaProductRepository());
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export const getAllProducts = async (_: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== getAllProducts =====');
    const list = await service.findAll();
    res.status(200).json(list);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<any> => {
  try {
    if (DEBUG_MODE) console.log('\n===== getProductById =====', req.params.product_id);
    const p = await service.findById(req.params.product_id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(p);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== createProduct =====', req.body);
    let payload = {
      name: req.body.name,
      category: req.body.category,
      unit: req.body.unit,
      price: req.body.price,   // string or number ok (coercion)
      available: req.body.available,
      image: undefined as Buffer | undefined,
    };
    if (req.body.image) payload.image = req.body.image;

    const dto = CreateProductSchema.parse(payload);
    const created = await service.create(dto);
    res.status(201).json(created);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== updateProduct =====', req.params.product_id, req.body);
    const dto = UpdateProductSchema.parse({
      product_id: req.params.product_id,
      name: req.body.name,
      category: req.body.category,
      unit: req.body.unit,
      price: req.body.price,
      available: req.body.available,
      image: req.body.image,
    });
    const updated = await service.update(dto);
    res.status(200).json(updated);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) console.log('\n===== deleteProduct =====', req.params.product_id);
    await service.delete(req.params.product_id);
    res.status(204).send();
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};