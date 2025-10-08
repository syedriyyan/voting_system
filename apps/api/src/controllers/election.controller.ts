import { Request, Response } from "express";
import Election from "../models/Election.model";

export class ElectionController {
  static async create(req: Request, res: Response) {
    try {
      const { title, description, startDate, endDate, candidates } = req.body;

      const election = new Election({
        title,
        description,
        startDate,
        endDate,
        candidates,
        status: "draft",
      });

      await election.save();

      res.status(201).json({
        message: "Election created successfully",
        election,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating election", error });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const elections = await Election.find();
      res.json(elections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching elections", error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const election = await Election.findById(req.params.id);
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }
      res.json(election);
    } catch (error) {
      res.status(500).json({ message: "Error fetching election", error });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const election = await Election.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.json({
        message: "Election status updated successfully",
        election,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating election status", error });
    }
  }
}
