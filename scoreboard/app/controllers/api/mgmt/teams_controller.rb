class Api::Mgmt::TeamsController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    teams = []

    Team.all.each do |team|
      teams.push(
        team.as_json(
          except: %i[created_at updated_at],
          include: {
            user: {
              except: %i[
                created_at
                updated_at
                password
                team_id
                role
              ]
            }
          }
        )
      )
    end

    render json: teams
  end

  def create # TODO: FIXME double check
    team = Team.new(params[:team].permit!)

    if team.save
      render json: { 'team': team.as_json(
        except: %i[created_at updated_at],
        include: {
          user: {
            except: %i[
              created_at
              updated_at
              password
              team_id
            ]
          },
          players: {
            except: %i[
              created_at
              updated_at
              team_id
            ]
          }
        }
      ) }
    else
      render json: { 'errors': team.errors }, status: :internal_server_error
    end
  end

  def update
    team = Team.find(params[:id])

    if team.update(params[:team].permit!)
      render json: {}
    else
      render json: { 'errors': team.errors }, status: :internal_server_error
    end
  end

  def destroy
    team = Team.find(params[:id])
    team.destroy

    render json: {}
  end
end
