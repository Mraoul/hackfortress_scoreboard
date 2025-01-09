class Api::Mgmt::StatusesController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    statuses = Status.includes(participant: [:team])

    render json: statuses.as_json(
      except: %i[created_at updated_at participant_id],
      include: {
        participant: {
          only: [],
          include: {
            team: {
              only: [:name]
            }
          }
        }
      }
    )
  end

  def create
    team = params.require(:team)
    event = params.require(:event)

    round_active = Game.instance.live
    created = nil

    if round_active.nil?
      render json: { 'error': 'round not active' }, status: :bad_request
      return
    end

    unless %w[1 2].include?(team)
      render json: { 'error': 'unknown team' }, status: :bad_request
      return
    end

    unless %w[cap_delay cap_block].include?(event)
      render json: { 'error': 'unknown event' }, status: :bad_request
      return
    end

    participant = if team.to_i - 1 == 0
                    round_active.red_participant
                  else
                    round_active.blue_participant
                  end

    if participant.nil?
      render json: { 'error': 'unable to query participant' }, status: :bad_request
      return
    end

    if event == 'cap_delay'
      created = GameServices::CapDelayAdder.call(participant, 100)
    elsif event == 'cap_block'
      created = GameServices::CapBlockAdder.call(participant)
    end

    render json: {}
  end

  def destroy
    Status.find(params.require(:id)).destroy
    render json: {}
  end
end
