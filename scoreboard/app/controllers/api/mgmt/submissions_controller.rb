class Api::Mgmt::SubmissionsController < Api::ApplicationController
  before_action :authenticate_judge

  def index
    response = []
    Submission.all.each do |submission|
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
