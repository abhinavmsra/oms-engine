import { Request, Response } from 'express';

export const ping = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
}
