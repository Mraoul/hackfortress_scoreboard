class Api::Mgmt::InventoriesController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    inventories = Inventory.includes(:item, participant: [:round]).all
    rounds = Inventory.organizeInventories(inventories)

    render json: { 'inventories': inventories, 'rounds': rounds }
  end

  def byRound
    round_id = params[:round_id].to_i
    rounds = Inventory.byRound(round_id)

    begin
      round_name = rounds.keys[0]
      inventory = rounds[round_name]
      new_inventory = []
      inventory.keys.each do |key|
        new_inventory.push({
                             'name': key,
                             'status': inventory[key]
                           })
      end
      render json: { 'name': round_name, 'inventory': new_inventory }
    rescue StandardError
      render json: {}
    end
  end

  def update
    inventory = Inventory.find(params[:id])

    begin
      inventory.update(params.require(:inventory).permit(:quantity))
    rescue StandardError
    end

    render json: {}
  end
end
