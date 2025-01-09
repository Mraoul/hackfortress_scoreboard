class Api::Mgmt::ItemsController < Api::ApplicationController
  before_action :authenticate_admin_only

  def create
    if params.has_key?(:id)
      begin
        master = Item.find(params[:id])
      rescue StandardError
        master = nil
      end

      if !master.nil?
        item_group = master.item_group
        item = master.dup
        item.name = 'Clone of ' + item.name
      else
        item = nil
      end
    else
      item_group = ItemGroup.find(params[:item_group_id])
      item = item_group.items.build(params[:item].permit!)
    end

    if !item.nil? && item.save
      render json: item
    else
      render json: { 'error': !item.nil? ? item.errors : 'Unable to create item' }, status: :internal_server_error
    end
  end

  def update
    item = Item.find(params[:id])

    if item.update(params[:item].permit!)
      render json: item
    else
      render json: { 'error': item.errors }, status: :internal_server_error
    end
  end

  def destroy
    item = Item.find(params[:id])
    item.destroy

    render json: {}
  end
end
