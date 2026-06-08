const { SupabaseModel, registerModel } = require("./baseModel");

class TeamMemberModel extends SupabaseModel {
  constructor() {
    super("team_members", {
      section: "TeamSection"
    });
  }
}

const TeamMember = new TeamMemberModel();
registerModel("TeamMember", TeamMember);

module.exports = TeamMember;