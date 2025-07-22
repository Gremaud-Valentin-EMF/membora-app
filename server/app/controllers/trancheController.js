const trancheService = require("../services/trancheService");

const trancheController = {
  async create(req,res){
    try{
      const tranche = await trancheService.create(req.body);
      res.status(201).json(tranche);
    }catch(err){
      res.status(400).json({message: err.message});
    }
  },
  async update(req,res){
    try{
      const tranche = await trancheService.update(req.params.id, req.body);
      res.json(tranche);
    }catch(err){
      res.status(400).json({message: err.message});
    }
  },
  async delete(req,res){
    await trancheService.delete(req.params.id);
    res.status(204).end();
  },
  async getByEvent(req,res){
    const tranches = await trancheService.getByEvenement(req.params.event_id);
    res.json(tranches);
  }
};

module.exports = trancheController;
