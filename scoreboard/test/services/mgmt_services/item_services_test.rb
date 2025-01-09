# frozen_string_literal: true

require 'test_helper'

class ItemServicesTest < ActionDispatch::IntegrationTest
  test 'items export' do
    exported = MgmtServices::ItemServices::ItemExporter.call
    assert exported['ItemGroups'].length.positive?

    exportedItemGroup = exported['ItemGroups'][0]

    assert_includes exportedItemGroup, 'name'
    assert_includes exportedItemGroup, 'description'
    assert_includes exportedItemGroup, 'picture_location'
    assert_includes exportedItemGroup, 'discountable'
    assert_includes exportedItemGroup, 'hack_item'
    assert_includes exportedItemGroup, 'items'
    assert exportedItemGroup['items'].length.positive?

    exportedItem = exportedItemGroup['items'][0]
    assert_includes exportedItem, 'name'
    assert_includes exportedItem, 'cost'
    assert_includes exportedItem, 'effect_iden'
    assert_includes exportedItem, 'friendly_text'
    assert_includes exportedItem, 'is_buff'
    assert_includes exportedItem, 'description'
    assert_includes exportedItem, 'starting_quantity'
    assert_includes exportedItem, 'discountable'
    assert_includes exportedItem, 'modifier'
    assert_includes exportedItem, 'players'
    assert_includes exportedItem, 'argument'
  end

  test 'items import' do
    exported = MgmtServices::ItemServices::ItemExporter.call
    itemCount = Item.count
    ItemGroup.destroy_all
    assert ItemGroup.all.length.zero?
    MgmtServices::ItemServices::ItemImporter.call(JSON.dump(exported))
    assert ItemGroup.all.length.positive?
    assert_equal Item.count, itemCount
  end

  test 'items import dups' do
    exported = MgmtServices::ItemServices::ItemExporter.call
    itemCount = Item.count
    exported = { 'ItemGroups' => exported['ItemGroups'].push(*exported['ItemGroups']) }
    ItemGroup.destroy_all
    error_msgs = MgmtServices::ItemServices::ItemImporter.call(JSON.dump(exported))
    assert error_msgs.length.positive?
    assert_equal Item.count, itemCount
    assert items(:item1)
  end
end
