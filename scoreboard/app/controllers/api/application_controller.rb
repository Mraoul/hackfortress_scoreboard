# frozen_string_literal: true

# API Application Controller Base
class Api::ApplicationController < ApplicationController
  prepend_before_action :authenticate

  def judge?
    %w[judge admin].include?(@current_user.role) ? true : false
  end

  def admin?
    @current_user.role == 'admin'
  end

  def contestant?
    @current_user.role == 'contestant'
  end

  def authenticate_admin_only
    render json: { 'error': 'insufficient privileges' }, status: :forbidden unless admin?
  end

  def authenticate_judge
    render json: { 'error': 'insufficient privileges' }, status: :forbidden unless judge?
  end

  def authenticate
    payload = JsonWebToken.decode_request(request)
    user_id = payload[:user_id]
    @current_user = UserCache.find_or_create_by(user_id)
    @current_team = @current_user.team
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error("Received JWT with invalid user_id #{e}")
    render json: { errors: 'unknown user' }, status: :unauthorized
  rescue JWT::ExpiredSignature => e
    Rails.logger.info("Recieved expired JWT #{e}")
    render json: { errors: 'expired token' }, status: :unauthorized
  rescue JWT::DecodeError => e
    Rails.logger.error("Received invalid JWT: #{e}")
    render json: { errors: 'invalid token' }, status: :unauthorized
  end

  def no_route
    render json: { 'error': 'path does not exist' }, status: :bad_request
  end
end
