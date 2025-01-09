# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class SubmissionAttemptsControllerTest < BaseControllerTest
  test 'admin list submission attempts' do
    get url_for(controller: 'api/mgmt/submission_attempts', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert response_json.length.positive?
    assert_includes response_json[0], 'solution'
    assert_includes response_json[0], 'player'
    assert_includes response_json[0], 'puzzle'
  end
end
