# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class SessionsControllerTest < BaseControllerTest
  setup do
    RedisClient.instance.client.flushdb
  end

  teardown do
    RedisClient.instance.client.flushdb
  end

  test 'contestant valid login' do
    post url_for(controller: 'api/sessions', action: 'login'), params: {
      user: 'team1',
      pass: 'password'
    }

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_includes json_response, 'token'
  end

  test 'contestant bad password' do
    post url_for(controller: 'api/sessions', action: 'login'), params: {
      user: 'team1',
      pass: 'no password'
    }

    assert_response :unauthorized
  end

  test 'contestant bad user' do
    post url_for(controller: 'api/sessions', action: 'login'), params: {
      user: 'nosuchuser',
      pass: 'no password'
    }

    assert_response :unauthorized
  end

  test 'validate_token' do
    get url_for(controller: 'api/sessions', action: 'validate_token'), headers: @team1_headers
    assert_response :success
  end

  test 'contestant status' do
    get url_for(controller: 'api/sessions', action: 'status'), headers: @team1_headers
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_includes json_response, 'userid'
    assert json_response['userid'] == users(:user2).id
    assert_includes json_response, 'teamid'
  end

  test 'admin status' do
    get url_for(controller: 'api/sessions', action: 'status'), headers: @admin_headers
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_includes json_response, 'userid'
    assert json_response['userid'] == users(:user1).id
  end

  test 'admin invalidate tokens' do
    user = User.find(users(:user4).id)
    token = JsonWebToken.generate(user)
    post url_for(controller: 'api/sessions', action: 'invalidate'), params: {
      username: user.username
    }, headers: @admin_headers
    assert_response :success

    assert_raises(JWT::ExpiredSignature) do
      JsonWebToken.decode(token)
    end
  end

  test 'contestant cannot invalidate tokens' do
    user = User.find(users(:user4).id)
    token = JsonWebToken.generate(user)
    post url_for(controller: 'api/sessions', action: 'invalidate'), params: {
      username: user.username
    }, headers: @team1_headers
    assert_response :forbidden
  end

  test 'judge cannot invalidate tokens' do
    user = User.find(users(:user4).id)
    token = JsonWebToken.generate(user)
    post url_for(controller: 'api/sessions', action: 'invalidate'), params: {
      username: user.username
    }, headers: @judge_headers
    assert_response :forbidden
  end
end
