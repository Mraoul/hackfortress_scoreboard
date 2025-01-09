class Api::Mgmt::StoresController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    active_round = Game.instance.live

    response = {
      status_red: active_round.red_participant.store_status,
      status_blue: active_round.blue_participant.store_status,
      sale_ratio: active_round.store_sale_ratio
    }

    render json: response
  end

  def update
    active_round = Game.instance.live

    if params[:store][:sale_ratio]
      active_round.store_sale_ratio = params[:store][:sale_ratio]
      active_round.save
    end

    render json: {}
  end

  def reset
    Item.reset_stock
    render json: {}
  end
end
