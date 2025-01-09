# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class PuzzlesControllerTest < BaseControllerTest
  setup do
    @category = categories(:category43)
    @puzzle = puzzles(:puzzle350)
  end
  test 'judge create puzzle' do
    post url_for(controller: 'api/mgmt/puzzles', action: :create), params: {
      category_id: @category.id,
      puzzle: {
        name: 'Test Puzzle',
        description: 'test desc',
        hints: 'test hint'
      }

    }, headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'description'
    assert_includes response_json, 'hints'
    assert_includes response_json, 'name'
    assert_includes response_json, 'data'
    assert_includes response_json, 'solution'
    assert_includes response_json, 'quickdraw'
    assert_includes response_json, 'fcfs'
    assert_includes response_json, 'points'
    assert_includes response_json, 'unlock'
    assert_includes response_json, 'author'
    assert_includes response_json, 'data_source'

    assert response_json['name'] == 'Test Puzzle'
  end

  test 'judge clones puzzle' do
    post url_for(controller: 'api/mgmt/puzzles', action: :create), params: {
      id: @puzzle.id

    }, headers: @judge_headers
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_includes response_json, 'description'
    assert_includes response_json, 'hints'
    assert_includes response_json, 'name'
    assert_includes response_json, 'data'
    assert_includes response_json, 'solution'
    assert_includes response_json, 'quickdraw'
    assert_includes response_json, 'fcfs'
    assert_includes response_json, 'points'
    assert_includes response_json, 'unlock'
    assert_includes response_json, 'author'
    assert_includes response_json, 'data_source'

    assert response_json['name'].starts_with? 'Clone of '
  end

  test 'judge updates puzzle' do
    put url_for(controller: 'api/mgmt/puzzles', action: :update, id: @puzzle.id), params: {
      puzzle: {
        solution: 'new solution'
      }
    }, headers: @judge_headers
    assert_response :success
    @puzzle.reload
    assert @puzzle.solution == 'new solution'
  end

  test 'judge deletes puzzle' do
    delete url_for(controller: 'api/mgmt/puzzles', action: :destroy, id: @puzzle.id), headers: @judge_headers
    assert_response :success
    assert_raises do
      @puzzle.reload
    end
  end

  test 'judge runs puzzle stats' do
    get url_for(controller: 'api/mgmt/puzzles', action: 'stats'), headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'solved'
    assert_includes response_json, 'unsolved'
    assert_includes response_json, 'unattempted'
    assert_includes response_json, 'solvedByCategory'
    assert_includes response_json, 'unsolvedByCategory'
    assert_includes response_json, 'unattemptedByCategory'
    assert_includes response_json, 'numTimeSolved'
    assert_includes response_json, 'attemptsByPuzzle'
    assert_includes response_json, 'solvedByTeam'
    assert_includes response_json, 'attemptsByTeam'
  end
end
