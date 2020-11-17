import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
  req: Request | any;
  res: Response;
  redis: Redis;
}