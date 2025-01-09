# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class BaseController < Api::ApplicationController
  before_action :authenticate_judge, only: %i[judge_test]
  before_action :authenticate_admin_only, only: %i[admin_test]

  def any_test
    render body: nil
  end

  def contestant_test
    if contestant?
      render body: nil
    else
      render body: nil, status: :bad_request
    end
  end

  def judge_test
    render body: nil
  end

  def admin_test
    render body: nil
  end
end

class AuthorizationTest < BaseControllerTest
  setup do
    Rails.application.routes.draw do
      get 'judge_test' => 'base#judge_test'
      get 'admin_test' => 'base#admin_test'
      get 'any_test' => 'base#any_test'
      get 'contestant_test' => 'base#contestant_test'
    end
  end

  teardown do
    Rails.application.reload_routes!
  end

  test 'authentication required' do
    get '/any_test'
    assert_response :unauthorized
  end

  test 'contestant can access' do
    get '/contestant_test', headers: @team1_headers
    assert_response :success
  end

  test 'non-contestant gets bad_request' do
    get '/contestant_test', headers: @judge_headers
    assert_response :bad_request
  end

  test 'contestant can access any method' do
    get '/any_test', headers: @team1_headers
    assert_response :success
  end

  test 'judge can access any method' do
    get '/any_test', headers: @judge_headers
    assert_response :success
  end

  test 'admin can access any method' do
    get '/any_test', headers: @admin_headers
    assert_response :success
  end

  test 'contestant cant access judge method' do
    get '/judge_test', headers: @team1_headers
    assert_response :forbidden
  end

  test 'judge can access judge method' do
    get '/judge_test', headers: @judge_headers
    assert_response :success
  end

  test 'admin can access judge method' do
    get '/judge_test', headers: @admin_headers
    assert_response :success
  end

  test 'contestant cant access admin method' do
    get '/admin_test', headers: @team1_headers
    assert_response :forbidden
  end

  test 'judge cant access admin method' do
    get '/admin_test', headers: @judge_headers
    assert_response :forbidden
  end

  test 'admin can access admin method' do
    get '/admin_test', headers: @admin_headers
    assert_response :success
  end
end
