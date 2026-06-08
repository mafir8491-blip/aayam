const { SupabaseModel, registerModel } = require("./baseModel");

class ReachOutModel extends SupabaseModel {
  constructor() {
    super("reach_outs");
  }
}

const ReachOut = new ReachOutModel();
registerModel("ReachOut", ReachOut);

module.exports = ReachOut;
