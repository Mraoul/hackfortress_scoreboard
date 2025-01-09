class Api::Mgmt::PlayerPointsController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    players = Player.includes(:player_points, :team).all
    teams = {}
    max_rounds = 0

    players.each do |player|
      score_list = {}
      teams[player.team.name] = [] unless teams.has_key?(player.team.name)

      player.player_points.each do |p|
        score_list[p.round_id] = 0 unless score_list.has_key?(p.round_id)

        score_list[p.round_id] += p.points
      end

      max_rounds = score_list.length if score_list.length > max_rounds

      teams[player.team.name].push({
                                     'name': player.name,
                                     'scores': score_list
                                   })
    end

    render json: {
      'teams': teams,
      'max_rounds': max_rounds
    }
  end
end
