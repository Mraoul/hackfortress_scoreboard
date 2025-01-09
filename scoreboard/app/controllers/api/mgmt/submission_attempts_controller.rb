class Api::Mgmt::SubmissionAttemptsController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    response = []
    SubmissionAttempt.all.each do |submission|
      response.push(
        submission.as_json(
          except: %i[created_at updated_at],
          include: {
            player: {
              only: [:name],
              include: {
                team: {
                  only: [:name]
                }
              }
            },
            puzzle: {
              only: [:name]
            }
          }
        )
      )
    end
    render json: response
  end
end
