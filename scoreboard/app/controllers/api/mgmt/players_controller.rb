class Api::Mgmt::PlayersController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    response = { 'players': [], 'teams': [] }

    Player.all.each do |player|
      response[:players].push(
        player.as_json(
          except: %i[created_at updated_at],
          methods: :points
        )
      )
    end

    Team.all.each do |team|
      response[:teams].push(
        team.as_json(
          only: %i[id name]
        )
      )
    end

    render json: response
  end

  def create
    player_params = params.require(:player).permit(%i[name email team_id])
    player = Player.new(player_params)
    player.save
    render json: player
  end

  def update
    player = Player.find(params.require(:id))

    if player.nil?
      render json: { 'error': 'unknown player' }, status: :bad_request
      return
    end

    player_params = params.require(:player).permit(%i[name email])

    if player_params.has_key?(:name)
      if player_params[:name].length > 255
        render json: { 'error': 'Name too long' }, status: :bad_request
        return
      end

      # Don't allow 'Team Effort' to be changed
      if player.name == 'Team Effort' || player_params[:name] == 'Team Effort'
        render json: { 'error': 'Team Effort is a reserved player name!' }, status: :bad_request
        return
      end
      player.name = player_params[:name]

    end

    if player_params.has_key?(:email)
      if player_params[:email].length > 255
        render json: { 'error': 'Email too long' }, status: :bad_request
        return
      end
      player.email = player_params[:email]
    end

    if player.save
      render json: {}
    else
      render json: { 'error': player.errors }, status: :internal_server_error
    end
  end

  def destroy
    player = Player.find(params[:id])
    player.destroy

    render json: {}
  end
end
