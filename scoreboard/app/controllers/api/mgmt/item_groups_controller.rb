class Api::Mgmt::ItemGroupsController < Api::ApplicationController
  before_action :authenticate_admin_only

  def index
    response = []
    ItemGroup.all.each do |item_group|
      response.push(
        item_group.as_json(
          except: %i[created_at updated_at]
        )
      )
    end

    render json: response
  end

  def show
    item_group = ItemGroup.find(params[:id])
    render json: item_group.as_json(
      except: %i[created_at updated_at],
      include: {
        items: {
          except: %i[created_at updated_at]
        }
      }
    )
  end

  def export
    item_data = MgmtServices::ItemServices::ItemExporter.call
    send_data(item_data.to_json, filename: 'items.json', type: 'application/json')
  end

  def import
    file_cont = params.require(:item_data).read

    error_strings = MgmtServices::ItemServices::ItemImporter.call(file_cont)
    if error_strings.length > 0
      render json: { "errors": error_strings }, status: :bad_request
    else
      render json: {}
    end
  end

  def create
    item_group = ItemGroup.new(params[:item_group].permit!)

    if item_group.save
      render json: item_group
    else
      render json: { 'error': item_group.errors }, status: :internal_server_error
    end
  end

  def update
    item_group = ItemGroup.find(params[:id])

    if item_group.update(params[:item_group].permit!)
      render json: item_group
    else
      render json: { 'error': item_group.errors }, status: :internal_server_error
    end
  end

  def destroy
    item_group = ItemGroup.find(params[:id])
    item_group.destroy

    render json: {}
  end
end
