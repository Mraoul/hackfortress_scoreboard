# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class PuzzlesControllerTest < BaseControllerTest
  setup do
  end

  test 'calling round_puzzles without color fails' do
    get url_for(controller: 'api/puzzles', action: 'round_puzzles', color: ''), params: {}, headers: @team1_headers

    assert_response :bad_request
  end

  test 'no live return empty data' do
    Game.instance.stop
    get url_for(controller: 'api/puzzles', action: 'round_puzzles', color: 'red'), params: {}, headers: @team1_headers
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_empty json_response
  end

  test 'calling with bad color' do
    get url_for(controller: 'api/puzzles', action: 'round_puzzles', color: 'black'), params: {}, headers: @team1_headers
    assert_response :bad_request
  end

  test 'calling with team not playing' do
    get url_for(controller: 'api/puzzles', action: 'round_puzzles', color: 'red'), params: {}, headers: @team3_headers
    assert_response :forbidden
  end

  test 'contestant calling with live' do
    get url_for(controller: 'api/puzzles', action: 'round_puzzles', color: 'red'), params: {}, headers: @team1_headers
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_not_empty json_response
    assert_includes json_response, 'categories'
    category_name = categories(:category43).name
    assert_includes json_response['categories'], category_name
    assert_includes json_response['categories'][category_name], 'puzzles'
    assert_not_empty json_response['categories'][category_name], 'puzzles'
    assert_includes json_response['categories'][category_name]['puzzles'][0], 'description'
    assert_not_includes json_response['categories'][category_name]['puzzles'][0], 'solution'
    assert_not_includes json_response['categories'][category_name]['puzzles'][0], 'hints'
  end

  test 'admin calling with live' do
    get url_for(controller: 'api/puzzles', action: 'round_puzzles', color: 'red'), params: {}, headers: @admin_headers
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_not_empty json_response
    assert_includes json_response, 'categories'
    category_name = categories(:category43).name
    assert_includes json_response['categories'], category_name
    assert_includes json_response['categories'][category_name], 'puzzles'
    assert_not_empty json_response['categories'][category_name], 'puzzles'
    assert_includes json_response['categories'][category_name]['puzzles'][0], 'description'
    assert_includes json_response['categories'][category_name]['puzzles'][0], 'solution'
    assert_includes json_response['categories'][category_name]['puzzles'][0], 'hints'
  end

  test 'contestant submits correct solution' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    post url_for(controller: 'api/puzzles', action: 'submit_solution'), params: {
      team: participant.id,
      player: player.id,
      puzzle: puzzle.id,
      soln: puzzle.solution
    }, headers: @team1_headers

    assert_response :success
    assert JSON.parse(response.body)
  end

  test 'contestant submits empty solution' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    post url_for(controller: 'api/puzzles', action: 'submit_solution'), params: {
      team: participant.id,
      player: player.id,
      puzzle: puzzle.id,
      soln: ''
    }, headers: @team1_headers

    assert_response :bad_request
    assert JSON.parse(response.body)
  end

  test 'contestant submits twice' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    post url_for(controller: 'api/puzzles', action: 'submit_solution'), params: {
      team: participant.id,
      player: player.id,
      puzzle: puzzle.id,
      soln: puzzle.solution
    }, headers: @team1_headers

    assert_response :success

    post url_for(controller: 'api/puzzles', action: 'submit_solution'), params: {
      team: participant.id,
      player: player.id,
      puzzle: puzzle.id,
      soln: puzzle.solution
    }, headers: @team1_headers

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert json_response['reason'] == 'solved'
  end

  test 'contestant submits incorrect solution' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    post url_for(controller: 'api/puzzles', action: 'submit_solution'), params: {
      team: participant.id,
      player: player.id,
      puzzle: puzzle.id,
      soln: 'not the solution'
    }, headers: @team1_headers

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert json_response['reason'] == 'incorrect'
  end
end
