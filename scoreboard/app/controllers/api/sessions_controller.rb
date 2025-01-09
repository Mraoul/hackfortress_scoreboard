# frozen_string_literal: true

# Sessions Controller
class Api::SessionsController < Api::ApplicationController
  before_action :authenticate_admin_only, only: :invalidate
  skip_before_action :authenticate, only: %i[login logout]

  def login
    (username, password) = params.require(%i[user pass])

    user = User.where(username: username, password: User.passhash(password)).first
    if user.nil?
      render json: { error: 'unable to authenticate' }, status: :unauthorized
    else
      exp = 12.hours.from_now
      token = JsonWebToken.generate(user, exp)

      # Seed the cache
      UserCache.find_or_create_by(user.id)

      render json: {
        token: token,
        exp: exp.strftime('%m-%d-%Y %H:%M:%S')
      }, status: :ok
    end
  end

  def validate_token
    render json: { 'status': 'okay' }, status: :ok
  end

  def logout
    begin
      token = JsonWebToken.get_token(request)
      payload = JsonWebToken.decode(token)
      UserCache.clear_cache_of(payload[:user_id])
      JsonWebToken.invalidate(token, payload)
    rescue JWT::ExpiredSignature, JWT::DecodeError, StandardError
      Rails.logger.warn('Logout of invalid token')
    end

    render json: {}, status: :ok
  end

  def status
    status = {
      "username": @current_user.username,
      "userid": @current_user.id,
      "role": @current_user.role
    }

    if @current_user.role == 'contestant' && !@current_team.nil?
      status.merge!({
                      'teamname': @current_team.name,
                      'teamid': @current_team.id
                    })

      round = Game.with_live.instance.live
      if round
        participant = round.get_participant_with_team_id(@current_team.id)
        status['color'] = participant.color if participant
      end
    end

    render json: status
  end

  def invalidate
    username = params.require(:username)
    user = User.where(username: username).first
    JsonWebToken.invalidate_tokens(username) if user
    render json: {}, status: :ok
  end
end
