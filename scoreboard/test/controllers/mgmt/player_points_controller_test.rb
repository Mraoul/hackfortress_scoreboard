# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class PlayerPointsControllerTest < BaseControllerTest
  test 'admin get player points' do
    team = teams(:team1)
    get url_for(controller: 'api/mgmt/player_points', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'teams'
    assert_includes response_json, 'max_rounds'
    assert_includes response_json['teams'], team.name
    assert response_json['teams'][team.name].length.positive?
    assert_includes response_json['teams'][team.name][0], 'name'
    assert_includes response_json['teams'][team.name][0], 'scores'
  end
end
