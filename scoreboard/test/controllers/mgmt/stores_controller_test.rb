# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class StoresControllerTest < BaseControllerTest
  test 'admin list store data' do
    get url_for(controller: 'api/mgmt/stores', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'status_red'
    assert_includes response_json, 'status_blue'
    assert_includes response_json, 'sale_ratio'
  end

  test 'admin update store sale ratio' do
    game = games(:game1)
    assert game.live.store_sale_ratio == 100
    put url_for(controller: 'api/mgmt/stores', action: :update), params: {
      store: {
        sale_ratio: 50
      }
    }, headers: @admin_headers
    assert_response :success
    game.live.reload
    assert game.live.store_sale_ratio == 50
  end
end
