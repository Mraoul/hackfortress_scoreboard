# frozen_string_literal: true

# Contestants Controller
class Api::ContestantsController < Api::ApplicationController
  before_action :authenticate
  wrap_parameters false

  def change_password
    (id, password) = params.permit(%i[id password]).require(%i[id password])

    begin
      user = User.find(id)
    rescue ActiveRecord::RecordNotFound
      render json: { 'error': 'unknown user' }, status: :bad_request
      return
    end

    if @current_user.id != user.id
      Rails.logger.info("Unauthorized password change attempt, logged in user #{@current_user.id}, user #{user.id}")
      render json: { "error": 'unauthorized password change attempt' }, status: :forbidden
      nil
    else
      Rails.logger.info("Updating Password for user #{user.username}")
      user.password = User.passhash(password)
      if user.save
        render json: {}
      else
        render json: { "error": 'unable to save record' }, status: :internal_server_error
      end
    end
  end

  def list_players
    json_response = {
      players: []
    }

    if contestant?
      Player.where(team_id: @current_team.id).each do |player|
        json_response[:players].push(
          player.as_json(
            only: %i[id name email]
          )
        )
      end
    end

    render json: json_response
  end

  def update_player
    permitted = params.permit(%i[id name email]).with_defaults!({ email: '' })
    (player_id, player_name) = permitted.require(%i[id name])
    player_email = permitted[:email]

    begin
      player = Player.find(player_id)
    rescue ActiveRecord::RecordNotFound
      render json: { 'error': 'unknown player' }, status: :bad_request
      return
    end

    if @current_team.id == player.team_id && player.name != 'Team Effort'
      if player_name.length > 255
        render json: { 'error': 'Name too long' }, status: :bad_request
        return
      end

      if player_name == 'Team Effort'
        render json: { 'error': 'Team Effort is a reserved player name!' }, status: :bad_request
        return
      end

      player.name = player_name

      if player_email.length > 255
        render json: { 'error': 'Email too long' }, status: :bad_request
        return
      end
      player.email = player_email

      if player.save
        render json: {}
      else
        render json: { 'error': player.errors }, status: :internal_server_error
      end
    else
      render json: { 'error': 'unauthorized changed request' }, status: :forbidden
    end
  end
end
