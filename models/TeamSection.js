const { SupabaseModel, registerModel } = require("./baseModel");

class TeamSectionModel extends SupabaseModel {
  constructor() {
    super("team_sections");
  }
}

const TeamSection = new TeamSectionModel();
registerModel("TeamSection", TeamSection);

module.exports = TeamSection;
