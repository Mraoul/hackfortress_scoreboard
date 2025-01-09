# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class TeamsControllerTest < BaseControllerTest
  test 'admin list all teams' do
    get url_for(controller: 'api/mgmt/teams', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert response_json.length.positive?
    assert_includes response_json[0], 'name'
    assert_includes response_json[0], 'user'
    assert_includes response_json[0]['user'], 'username'
  end

  test 'admin create team' do
    post url_for(controller: 'api/mgmt/teams', action: :create), params: {
      team: {
        name: 'TestTeam'
      }
    }, headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'team'
    assert_includes response_json['team'], 'user'
    assert_includes response_json['team'], 'players'
  end

  test 'admin update team' do
    team = teams(:team1)
    put url_for(controller: 'api/mgmt/teams', action: :update, id: team.id), params: {
      team: {
        name: 'NewName'
      }
    }, headers: @admin_headers
    assert_response :success
    team.reload
    assert team.name == 'NewName'
  end

  test 'admin delete team' do
    team = teams(:team1)
    user = team.user
    players = team.players
    delete url_for(controller: 'api/mgmt/teams', action: :destroy, id: team.id), headers: @admin_headers
    assert_response :success
    assert_raises do
      team.reload
    end
    assert_raises do
      user.reload
    end
    assert_raises do
      players[0].reload
    end
  end
end
