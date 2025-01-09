# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class UsersControllerTest < BaseControllerTest
  setup do
    @user = users(:user1)
  end
  test 'admin list users' do
    get url_for(controller: 'api/mgmt/users', action: :index), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'users'
    assert_includes response_json, 'roles'
    assert_includes response_json['users'][0], 'username'
    assert_includes response_json['users'][0], 'role'
  end

  test 'admin create user no role' do
    post url_for(controller: 'api/mgmt/users', action: :create), params: {
      user: {
        username: 'testuser',
        password: 'testpass'
      }
    }, headers: @admin_headers
    assert_response :success
  end

  test 'admin create user with role' do
    post url_for(controller: 'api/mgmt/users', action: :create), params: {
      user: {
        username: 'testuser',
        password: 'testpass',
        role: 'judge'
      }
    }, headers: @admin_headers
    assert_response :success
  end

  test 'judge cant update user' do
    put url_for(controller: 'api/mgmt/users', action: :update, id: @user.id), headers: @judge_headers
    assert_response :forbidden
  end

  test 'contestant cant update user' do
    put url_for(controller: 'api/mgmt/users', action: :update, id: @user.id), headers: @team1_headers
    assert_response :forbidden
  end

  test 'admin update user' do
    oldpassword = @user.password
    put url_for(controller: 'api/mgmt/users', action: :update, id: @user.id), params: {
      user: {
        username: 'newusername',
        password: 'newpassword',
        role: 'judge'
      }
    }, headers: @admin_headers
    assert_response :success
    @user.reload
    assert @user.username == 'newusername'
    assert @user.role == 'judge'
    assert @user.password != oldpassword
  end

  test 'admin cant update user username too long' do
    put url_for(controller: 'api/mgmt/users', action: :update, id: @user.id), params: {
      user: {
        username: 'x' * 300
      }
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin cant update user password empty' do
    put url_for(controller: 'api/mgmt/users', action: :update, id: @user.id), params: {
      user: {
        password: ''
      }
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin cant update user bad role' do
    put url_for(controller: 'api/mgmt/users', action: :update, id: @user.id), params: {
      user: {
        role: 'nosuchrole'
      }
    }, headers: @admin_headers
    assert_response :bad_request
  end

  test 'admin delete user' do
    delete url_for(controller: 'api/mgmt/users', action: :destroy, id: @user.id), headers: @admin_headers
    assert_response :success
    assert_raises do
      @user.reload
    end
  end
end
