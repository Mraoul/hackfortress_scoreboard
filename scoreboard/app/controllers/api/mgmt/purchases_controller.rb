class Api::Mgmt::PurchasesController < Api::ApplicationController
  before_action :authenticate_judge, except: [:destroy]
  before_action :authenticate_admin_only, only: [:destroy]

  def index
    response = {
      all_purchases: [],
      current_purchases: []
    }

    round = Game.instance.live
    Purchase.includes(:item, participant: %i[round team]).all.each do |purchase|
      purchase_data = purchase.as_json(
        only: %i[id sale_ratio],
        include: {
          item: {
            only: %i[name discountable cost]
          },
          participant: {
            only: [],
            include: {
              round: {
                only: %i[id name]
              },
              team: {
                only: [:name]
              }
            }
          }
        }
      )

      response[:all_purchases].push(purchase_data)

      if !round.nil? && purchase_data.dig('participant', 'round', 'name') == round.name
        response[:current_purchases].push(purchase_data)
      end
    end

    render json: response
  end

  def destroy
    purchase = Purchase.find(params.require(:id))
    purchase.destroy
    render json: { 'status' => 'ok' }
  end
end
