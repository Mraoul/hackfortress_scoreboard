module MgmtServices::ItemServices
  class ItemExporter < ApplicationService
    def initialize; end

    def call
      output = []
      item_groups = ItemGroup.includes(:items)
      item_groups.each do |item_group|
        igdata = item_group.as_json(
          except: %i[created_at updated_at],
          include: {
            items: {
              except: %i[created_at updated_at]
            }
          }
        )
        output.append(igdata)
      end
      { 'ItemGroups' => output }
    end
  end

  class ItemImporter < ApplicationService
    def initialize(raw_data)
      @raw_data = raw_data
    end

    def call
      error_strings = []

      begin
        require 'json'
        data = JSON.parse(@raw_data)
      rescue Exception => e
        error_strings.append(e.to_s)
        return error_strings
      end

      data = {} if data.nil?

      unless data.has_key?('ItemGroups')
        error_strings.append("Cannot find top level 'ItemGroups' element")
        return error_strings
      end

      data['ItemGroups'].each do |itemg|
        items = itemg.delete('items')
        item_group = ItemGroup.where(name: itemg['name']).first
        if item_group.nil? # doesn't exist
          # Need to create it
          item_group = ItemGroup.new(**itemg)

          unless item_group.save
            error_strings.append('Error Creating ItemGroup ' + itemg.to_s)
            item_group = nil
          end
        end

        items.each do |ite|
          item_name = ite['name']

          if item_name.nil?
            error_strings.append("Entry doesn't have an item name")
            next
          end

          item = Item.where(name: ite['name'], item_group_id: item_group.id).first

          if item.nil? # doesn't exist
            begin
              item = Item.new(item_group_id: item_group.id, **ite)
            rescue StandardError
              error_strings.append('Error instatiating item ' + item_name)
            else
              error_strings.append('Error Creating Item ' + item_name) unless item.save
            end
          else # exists
            error_strings.append('Item Name Already Exists -- Skipping: ' + item_name)
          end
        end
      end
      error_strings
    end
  end
end
