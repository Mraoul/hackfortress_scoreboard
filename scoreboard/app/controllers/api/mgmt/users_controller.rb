class Api::Mgmt::UsersController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    response = { "users": [], "roles": [] }
    User.roles.each do |name, value|
      response[:roles].push(
        {
          "name": name,
          "value": value
        }
      )
    end
    User.includes(:team).all.each do |user|
      response[:users].push(
        user.as_json(
          except: %i[created_at updated_at team_id password],
          include: {
            team: {
              only: %i[name id]
            }
          }
        )
      )
    end
    render json: response
  end

  # POST /users
  def create
    user_args = params.require(:user).permit(:username, :password, :role)
    user_args.require(%i[username password])

    user = User.new(user_args)
    user.password = User.passhash(user_args[:password])
    user.role_contestant! if user.role.nil?

    if user.save
      render json: { "status": 'ok' }
    else
      render json: { "status": 'error' }, status: :internal_server_error
    end
  end

  # PUT /users
  def update
    user = User.find(params.require(:id))

    if user.nil?
      render json: { 'error': 'unknown user' }, status: :bad_request
      return
    end

    user_params = params.require(:user).permit(%i[username password role])
    if user_params.has_key?('username')
      if user_params['username'].length > 255
        render json: { 'error': 'username too long' }, status: :bad_request
        return
      end
      user.username = user_params['username']
    end

    if user_params.has_key?('role')
      unless User.roles.include?(user_params['role'])
        render json: { 'error': 'unknown role' }, status: :bad_request
        return
      end
      user.role = user_params['role']
    end

    if user_params.has_key?('password')
      if user_params['password'].length == 0
        render json: { 'error': 'password cannot be empty' }, status: :bad_request
        return
      end
      user.password = User.passhash(user_params['password'])
    end

    if user.save
      render json: {}
    else
      render json: { "error": 'unable to save record' }, status: :internal_server_error
    end
  end

  # DELETE /users/1
  def destroy
    user = User.find(params[:id])
    user.destroy

    render json: { "status": 'ok' }
  end
end
