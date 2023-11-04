import { Request, Response } from "express";
import { IData, Data } from "../models/data";

export class DataController {
  public async getAllData(req: Request, res: Response): Promise<void> {
    const data = await Data.find();
    res.json({ data });
  }

  public async getData(req: Request, res: Response): Promise<void> {
    const data = await Data.findOne({ data_id: req.params.id });
    if (data === null) {
      res.sendStatus(404);
    } else {
      res.json(data);
    }
  }

  public async createData(req: Request, res: Response): Promise<void> {
    const newData: IData = new Data(req.body);
    const data = await Data.findOne({
      data_id: req.body.data_id,
    });
    if (data === null) {
      const result = await newData.save();
      if (result === null) {
        res.sendStatus(500);
      } else {
        res.status(201).json({ status: 201, data: result });
      }
    } else {
      res.sendStatus(422);
    }
  }

  public async updateData(req: Request, res: Response): Promise<void> {
    const data = await Data.findOneAndUpdate(
      { data_id: req.params.id },
      req.body
    );
    if (data === null) {
      res.sendStatus(404);
    } else {
      const updatedData = { data_id: req.params.id, ...req.body };
      res.json({ status: res.status, data: updatedData });
    }
  }

  public async deleteData(req: Request, res: Response): Promise<void> {
    const data = await Data.findOneAndDelete({
      data_id: req.params.id,
    });
    if (data === null) {
      res.sendStatus(404);
    } else {
      res.json({ response: "Data deleted Successfully" });
    }
  }
}
