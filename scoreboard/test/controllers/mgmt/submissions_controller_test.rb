# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class SubmissionsControllerTest < BaseControllerTest
  test 'admin list submissions' do
    get url_for(controller: 'api/mgmt/submissions', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert response_json.length.positive?
    assert_includes response_json[0], 'player'
    assert_includes response_json[0], 'value'
    assert_includes response_json[0], 'puzzle'
  end
end
