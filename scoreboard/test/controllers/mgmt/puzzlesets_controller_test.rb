# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class PuzzlesetsControllerTest < BaseControllerTest
  setup do
    @puzzleset = puzzlesets(:puzzleset1)
  end

  test 'judge list puzzlesets' do
    get url_for(controller: 'api/mgmt/puzzlesets', action: :index), headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert response_json.length.positive?
    assert_includes response_json[0], 'name'
  end

  test 'judge list puzzleset' do
    get url_for(controller: 'api/mgmt/puzzlesets', action: :show, id: @puzzleset.id), headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert response_json.length.positive?
    assert_includes response_json[0], 'name'
    assert_includes response_json[0], 'puzzles'
  end

  test 'judge list puzzleset 0' do
    get url_for(controller: 'api/mgmt/puzzlesets', action: :show, id: 0), headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert response_json.length.positive?
    assert_includes response_json[0], 'name'
    assert_includes response_json[0], 'puzzles'
  end

  test 'admin create new puzzleset' do
    post url_for(controller: 'api/mgmt/puzzlesets', action: :create), params: {
      puzzleset: {
        name: 'testpuzzleset'
      }
    }, headers: @admin_headers
    assert_response :success
  end

  test 'admin update puzzleset' do
    put url_for(controller: 'api/mgmt/puzzlesets', action: :update, id: @puzzleset.id), params: {
      puzzleset: {
        name: 'testpuzzleset'
      }
    }, headers: @admin_headers
    assert_response :success
    @puzzleset.reload
    assert @puzzleset.name == 'testpuzzleset'
  end

  test 'admin delete puzzleset' do
    delete url_for(controller: 'api/mgmt/puzzlesets', action: :update, id: @puzzleset.id), headers: @admin_headers
    assert_response :success
    assert_raises do
      @puzzleset.reload
    end
  end
end
