# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class ItemsControllerTest < BaseControllerTest
  setup do
    @item_group = item_groups(:item_group1)
    @item = items(:item1)
  end

  test 'admin create new item' do
    post url_for([:api, :mgmt, @item_group, :items]), params: {
      item_group_id: @item_group.id,
      item: {
        name: 'Hard Slap',
        cost: 30,
        description: 'Hard Slap Damage',
        discountable: false,
        modifier: 10,
        players: 6,
        argument: 30,
        starting_quantity: 9999
      }
    }, headers: @admin_headers

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'name'
    assert_includes response_json, 'description'
    assert response_json['name'] == 'Hard Slap'
  end

  test 'admin clone item' do
    post url_for([:api, :mgmt, @item_group, :items]), params: {
      id: @item.id
    }, headers: @admin_headers

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'name'
    assert_includes response_json, 'description'
    assert response_json['name'].starts_with? 'Clone'
  end

  test 'admin cant clone nonexistant item' do
    post url_for([:api, :mgmt, @item_group, :items]), params: {
      id: -1
    }, headers: @admin_headers

    assert_response :internal_server_error
  end

  test 'admin update item' do
    put url_for([:api, :mgmt, @item_group, @item]), params: {
      item: {
        name: 'ItemName'
      }
    }, headers: @admin_headers

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'name'
    assert response_json['name'] == 'ItemName'
    @item.reload
    assert @item.name == 'ItemName'
  end

  test 'admin delete item' do
    delete url_for([:api, :mgmt, @item_group, @item]), headers: @admin_headers
    assert_response :success

    assert_raises do
      @item.reload
    end
  end
end
