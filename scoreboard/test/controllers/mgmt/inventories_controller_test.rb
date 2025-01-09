# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class InventoriesControllerTest < BaseControllerTest
  test 'admin list_inventories' do
    get url_for(controller: 'api/mgmt/inventories', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'inventories'
    assert_includes response_json, 'rounds'
  end

  test 'contestant cant list_inventories' do
    get url_for(controller: 'api/mgmt/inventories', action: :index), headers: @team1_headers
    assert_response :forbidden
  end

  test 'admin inventories byRound' do
    get url_for(controller: 'api/mgmt/inventories', action: 'byRound', round_id: rounds(:round1).id),
        params: {},
        headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'inventory'
    assert_includes response_json, 'name'
    assert response_json['name'] == rounds(:round1).name
  end

  test 'admin inventories update' do
    assert inventories(:inventory1).quantity == 9999
    put url_for(controller: 'api/mgmt/inventories', action: :update, id: inventories(:inventory1).id),
        params: {
          id: inventories(:inventory1).id,
          inventory: {
            quantity: 99
          }
        },
        headers: @admin_headers
    assert_response :success
    inventories(:inventory1).reload
    assert inventories(:inventory1).quantity == 99
  end
end
