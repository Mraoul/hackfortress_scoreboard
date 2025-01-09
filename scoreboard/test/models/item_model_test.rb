# frozen_string_literal: true

require 'test_helper'

class ItemTest < ActiveSupport::TestCase
  setup do
    @participant = Participant.find(participants(:participant1).id)
    @participant.send(:create_inventories)
    @participant.inventories.each do |inventory|
      inventory.send(:initialize_count)
    end
  end

  test 'create item' do
    item = Item.new(
      name: 'testitem',
      cost: '10',
      description: 'test item',
      item_group_id: item_groups(:item_group10)
    )
    item.save

    assert_not @participant.inventory_of(item).nil?
  end

  test 'reset item stock' do
    item = Item.find(items(:item1).id)
    inventory = @participant.inventory_of(item)
    inventory.quantity = 0
    inventory.save

    Item.reset_stock

    inventory.reload
    assert_not inventory.quantity.zero?
  end
end
