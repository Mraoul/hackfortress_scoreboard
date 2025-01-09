# frozen_string_literal: true

class Api::Mgmt::ParticipantsController < Api::ApplicationController
  before_action :authenticate_admin_only, except: %i[update bonus_grant patch]
  before_action :authenticate_judge, only: %i[update bonus_grant patch]

  def index
    response = []
    Participant.includes(:team).all.each do |participant|
      response.push(
        participant.as_json(
          except: %i[
            team_id dominate
            created_at updated_at
          ],
          include: {
            round: {
              only: [:name]
            },
            team: {
              only: [:name]
            }
          }
        )
      )
    end

    render json: response
  end

  def bonus_grant
    (participant_id, bonus_value) = params.require(%i[id bonus_value])

    participant = Participant.where(id: participant_id).first
    bonus_value = bonus_value.to_i

    if participant.nil?
      render json: { 'error': 'Unable to find participant by that id' }, status: :bad_request
      return
    end

    if bonus_value.zero?
      render json: { "error": 'Bonus value zero ignored' }, status: :bad_request
      return
    end

    errors = MgmtServices::GameServices::BonusGranter.call(participant, bonus_value)
    if errors.nil?
      render json: {}
    else
      render(**errors)
    end
  end

  def update
    participant_id = params.require(:id)
    participant = Participant.where(id: participant_id).first
    if participant.nil?
      render json: { 'error': 'Unable to find participant by that id' }, status: :bad_request
      return
    end

    participant_data = params.require(:participant)
    participant_parms = participant_data.permit(
      :team_id, :hack_score, :bonus_score,
      :tf2_score, :hackcoins, :tf2coins
    )

    participant.with_lock do
      participant.update(
        participant_parms
      )

      if participant.save
        render json: {}
      else
        render json: { "errors": participant.errors }, status: :unprocessable_entity
      end
    end
  end

  def patch
    participant_id = params.require(:id)
    participant = Participant.where(id: participant_id).first
    if participant.nil?
      render json: { 'error': 'Unable to find participant by that id' }, status: :bad_request
      return
    end

    permitted = params.permit(
      :hack_score_mod, :bonus_score_mod,
      :tf2_score_mod, :hackcoins_mod,
      :tf2coins_mod, :hints_mod
    )

    response = MgmtServices::GameServices::ParticipantPatcher.call(participant, permitted)
    if response.nil?
      render json: {}
    else
      render(**response)
    end
  end
end
