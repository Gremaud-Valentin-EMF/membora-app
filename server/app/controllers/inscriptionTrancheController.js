const inscriptionService = require("../services/inscriptionTrancheService");
const trancheService = require("../services/trancheService");
const badgeService = require("../services/badgeService");

const inscriptionTrancheController = {
  async create(req,res){
    try{
      const tranche = await trancheService.getById(req.body.tranche_id);
      if(tranche.badge_categorie){
        const badges = await badgeService.getByMembre(req.body.membre_id);
        const has = badges.some(b=>b.categorie === tranche.badge_categorie);
        if(!has) return res.status(400).json({message:'Badge requis'});
      }
      const inscription = await inscriptionService.create(req.body);
      res.status(201).json(inscription);
    }catch(err){
      res.status(400).json({message:err.message});
    }
  },
  async delete(req,res){
    await inscriptionService.delete(req.params.id);
    res.status(204).end();
  },
  async getByTranche(req,res){
    const list = await inscriptionService.getByTranche(req.params.tranche_id);
    res.json(list);
  },
  async getByMembre(req,res){
    const list = await inscriptionService.getByMembre(req.params.membre_id);
    res.json(list);
  },
  async valider(req,res){
    const val = await inscriptionService.valider(req.params.id);
    res.json(val);
  }
};

module.exports = inscriptionTrancheController;
