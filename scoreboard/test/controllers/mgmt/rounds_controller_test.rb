# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class RoundsControllerTest < BaseControllerTest
  test 'admin get index' do
    get url_for(controller: '/api/mgmt/rounds', action: 'index'), params: {}, headers: @admin_headers
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_includes json_response, 'game'
  end

  test "contestants can't get index" do
    get url_for(controller: '/api/mgmt/rounds', action: 'index'), params: {}, headers: @team1_headers
    assert_response :forbidden
  end

  test 'admin create round with no teams' do
    post url_for(controller: '/api/mgmt/rounds', action: 'create'), params: {
      round: {
        name: 'TestRound'
      }
    }, headers: @admin_headers

    assert_response :success
  end

  test 'admin create round with teams' do
    post url_for(controller: '/api/mgmt/rounds', action: 'create'), params: {
      team1: teams(:team3).id,
      team2: teams(:team4).id,
      round: {
        name: 'TestRound'
      }
    }, headers: @admin_headers

    assert_response :success
  end

  test 'create round requires name' do
    post url_for(controller: '/api/mgmt/rounds', action: 'create'), params: {
      team1: teams(:team3).id,
      team2: teams(:team4).id,
      round: {
        foo: 'test'
      }
    }, headers: @admin_headers

    assert_response :bad_request
  end

  test 'admin create round with bad teams' do
    post url_for(controller: '/api/mgmt/rounds', action: 'create'), params: {
      team1: 1,
      team2: 2,
      round: {
        name: 'TestRound'
      }
    }, headers: @admin_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    id = json_response['id']
    round = Round.find(id)
    assert round.red_participant.team.nil?
    assert round.blue_participant.team.nil?
  end

  test 'admin ready round' do
    post url_for(controller: '/api/mgmt/rounds', action: 'ready_round', id: rounds(:round1).id), params: {},
                                                                                                 headers: @admin_headers

    assert_response :success
  end

  test "admin can't ready round without id" do
    post url_for(controller: '/api/mgmt/rounds', action: 'ready_round', id: ''), params: {}, headers: @admin_headers

    assert_response :bad_request
  end

  test "admin can't ready non-existant round" do
    post url_for(controller: '/api/mgmt/rounds', action: 'ready_round', id: '1'), params: {}, headers: @admin_headers

    assert_response :bad_request
  end

  test 'admin toggling already ready round off' do
    ready_id = Game.instance.ready.id
    post url_for(controller: '/api/mgmt/rounds', action: 'ready_round', id: ready_id), params: {},
                                                                                       headers: @admin_headers

    assert_response :success
    assert Game.instance.ready.nil?
  end

  test 'admin activate round' do
    post url_for(
      controller: '/api/mgmt/rounds', action: 'activate_round', id: rounds(:round1).id
    ),
         params: {},
         headers: @admin_headers

    assert_response :success
  end

  test "admin can't activate round without id" do
    post url_for(controller: '/api/mgmt/rounds', action: 'activate_round', id: ''), params: {}, headers: @admin_headers

    assert_response :bad_request
  end

  test "admin can't activate non-existant round" do
    post url_for(controller: '/api/mgmt/rounds', action: 'activate_round', id: '1'), params: {}, headers: @admin_headers

    assert_response :bad_request
  end

  test 'admin toggling already activated round off' do
    activate_id = Game.instance.live.id
    post url_for(controller: '/api/mgmt/rounds', action: 'activate_round', id: activate_id), params: {},
                                                                                             headers: @admin_headers

    assert_response :success
    assert Game.instance.live.nil?
  end

  test 'admin update round' do
    round = rounds(:round2)
    put url_for(controller: '/api/mgmt/rounds', action: 'update', id: round.id), params: {
      team1: teams(:team3).id,
      team2: teams(:team4).id,
      round: {
        name: 'TestRound'
      }
    }, headers: @admin_headers

    assert_response :success
  end

  test 'admin delete round' do
    round = rounds(:round3)
    delete url_for(controller: '/api/mgmt/rounds', action: 'destroy', id: round.id.to_s), params: {},
                                                                                          headers: @admin_headers

    assert_response :success
    assert Round.where(id: round.id).first.nil?
  end

  test 'admin calls puzzleviewer' do
    puzzleset = puzzlesets(:puzzleset1)
    get url_for(
      controller: '/api/mgmt/rounds', action: 'puzzleviewer', puzzleset_id: puzzleset.id
    ),
        params: {},
        headers: @admin_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_includes json_response, 'puzzles'
    assert_includes json_response, 'solved'
  end

  test "admin can't calls puzzleviewer with no id" do
    get url_for(controller: '/api/mgmt/rounds', action: 'puzzleviewer', puzzleset_id: ''), params: {},
                                                                                           headers: @admin_headers

    assert_response :bad_request
  end

  test 'admin access round console' do
    get url_for(controller: '/api/mgmt/rounds', action: 'round_console'), params: {}, headers: @admin_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_includes json_response, 'round'
    assert_includes json_response, 'participants'
    assert json_response['participants'].length == 2
    assert_includes json_response['participants'][0], 'players'
    assert_includes json_response['participants'][0], 'solved'
    assert_includes json_response['participants'][0]['participant'], 'team'
    assert_includes json_response, 'puzzles'
  end

  test 'admin access round console when no round' do
    Game.instance.stop
    get url_for(controller: '/api/mgmt/rounds', action: 'round_console'), params: {}, headers: @admin_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert json_response.empty?
  end
end
