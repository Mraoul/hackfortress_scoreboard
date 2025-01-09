# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class CategoriesControllerTest < BaseControllerTest
  test 'judge list categories' do
    get url_for(controller: 'api/mgmt/categories', action: :index), headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'categories'
    assert_includes response_json, 'puzzlesets'
    assert response_json['categories'].length.positive?
    assert response_json['puzzlesets'].length.positive?

    category = response_json['categories'][0]
    assert_includes category, 'name'

    puzzleset = response_json['puzzlesets'][0]
    assert_includes puzzleset, 'name'
  end

  test 'judge get category' do
    category = categories(:category43)

    get url_for(controller: 'api/mgmt/categories', action: :show, id: category.id), headers: @judge_headers
    assert_response :success
    response_json = JSON.parse(response.body)

    assert_includes response_json, 'category'
    assert_includes response_json, 'puzzlesets'

    category = response_json['category']
    assert_includes category, 'name'
    assert_includes category, 'puzzles'

    puzzle = category['puzzles'][0]
    assert_includes puzzle, 'name'
    assert_includes puzzle, 'description'

    puzzleset = response_json['puzzlesets'][0]
    assert_includes puzzleset, 'name'
  end

  test 'judge create new category' do
    post url_for(controller: 'api/mgmt/categories', action: :create), params: {
      category: {
        name: 'TestCategory'
      }
    }, headers: @judge_headers
    assert_response :success
    assert_not Category.where(name: 'TestCategory').first.nil?
  end

  test 'judge cant create dup category' do
    category = categories(:category43)
    post url_for(controller: 'api/mgmt/categories', action: :create), params: {
      category: {
        name: category.name
      }
    }, headers: @judge_headers
    assert_response :bad_request
  end

  test 'judge update category name' do
    category = categories(:category43)
    put url_for(controller: 'api/mgmt/categories', action: :update, id: category.id), params: {
      category: {
        name: 'NewName'
      }
    }, headers: @judge_headers
    assert_response :success
  end

  test 'judge cant update category name to dup' do
    category = categories(:category43)
    category2 = categories(:category44)

    put url_for(controller: 'api/mgmt/categories', action: :update, id: category.id), params: {
      category: {
        name: category2.name
      }
    }, headers: @judge_headers
    assert_response :bad_request
  end

  test 'judge destroy category' do
    category = categories(:category43)

    delete url_for(controller: 'api/mgmt/categories', action: :destroy, id: category.id), headers: @judge_headers
    assert_response :success

    assert_raises do
      category.reload!
    end
  end
end
