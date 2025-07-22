const badgeService = require("../services/badgeService");

const badgeController = {
  async create(req,res){
    try{
      const badge = await badgeService.create(req.body);
      res.status(201).json(badge);
    }catch(err){
      res.status(400).json({message:err.message});
    }
  },
  async getByMembre(req,res){
    const badges = await badgeService.getByMembre(req.params.membre_id);
    res.json(badges);
  }
};

module.exports = badgeController;
