# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class PlayersControllerTest < BaseControllerTest
  setup do
    @player = players(:player2)
    @team_effort_player = players(:player1)
  end

  test 'admin list players' do
    get url_for(controller: 'api/mgmt/players', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'players'
    assert_includes response_json, 'teams'
    assert_includes response_json['players'][0], 'points'
    assert_includes response_json['teams'][0], 'name'
  end

  test 'admin create player' do
    team = teams(:team1)
    post url_for(controller: 'api/mgmt/players', action: :index), params: {
      player: {
        name: 'Player99',
        email: 'email',
        team_id: team.id
      }
    }, headers: @admin_headers
    assert_response :success
    assert JSON.parse(response.body)
  end

  test 'admin update player' do
    put url_for(controller: 'api/mgmt/players', action: :update, id: @player.id), params: {
      player: {
        name: 'playername',
        email: 'playeremail'
      }
    }, headers: @admin_headers
    assert_response :success
  end

  test 'admin cant update player team effort' do
    put url_for(controller: 'api/mgmt/players', action: :update, id: @team_effort_player.id), params: {
      player: {
        name: 'playername',
        email: 'playeremail'
      }
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin cant update player name too long' do
    put url_for(controller: 'api/mgmt/players', action: :update, id: @team_effort_player.id), params: {
      player: {
        name: 'x' * 300,
        email: 'playeremail'
      }
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin cant update player email too long' do
    put url_for(controller: 'api/mgmt/players', action: :update, id: @team_effort_player.id), params: {
      player: {
        name: 'playername',
        email: 'x' * 300
      }
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin destroy player' do
    delete url_for(controller: 'api/mgmt/players', action: :destroy, id: @player.id), headers: @admin_headers
    assert_response :success
  end
end
