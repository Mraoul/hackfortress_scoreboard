# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class PurchasesControllerTest < BaseControllerTest
  test 'judge list purchases' do
    get url_for(controller: 'api/mgmt/purchases', action: :index), headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'all_purchases'
    assert_includes response_json, 'current_purchases'
  end

  test 'admin list purchases' do
    get url_for(controller: 'api/mgmt/purchases', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'all_purchases'
    assert_includes response_json, 'current_purchases'
  end

  test 'admin destroy purchase' do
    purchase = purchases(:purchase1)
    delete url_for(controller: 'api/mgmt/purchases', action: :destroy, id: purchase.id), headers: @admin_headers
    assert_response :success
    assert_raises do
      purchase.reload
    end
  end
end
