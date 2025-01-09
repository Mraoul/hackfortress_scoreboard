# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class ContestantsControllerTest < BaseControllerTest
  setup do
  end

  test 'contestant list_players' do
    get url_for(controller: 'api/contestants', action: 'list_players'), headers: @team1_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'players'
    assert_not_empty response_json['players']
  end

  test 'admin list_players' do
    get url_for(controller: 'api/contestants', action: 'list_players'), headers: @admin_headers
    assert_response :success
    response_json = JSON.parse(response.body)
    assert_includes response_json, 'players'
    assert_empty response_json['players']
  end

  test 'contestant update team player' do
    post url_for(controller: 'api/contestants', action: 'update_player'), params: {
      id: players(:player2).id,
      name: 'TestPlayer',
      email: 'testplayer@test.com'
    }, headers: @team1_headers

    assert_response :success
    player = Player.find(players(:player2).id)
    assert player.name == 'TestPlayer'
  end

  test 'contestant cannot update unknown player' do
    post url_for(controller: 'api/contestants', action: 'update_player'), params: {
      id: 999,
      name: 'TestPlayer',
      email: 'testplayer@test.com'
    }, headers: @team1_headers

    assert_response :bad_request
  end

  test 'contestant cannot update team player name too long' do
    post url_for(controller: 'api/contestants', action: 'update_player'), params: {
      id: players(:player2).id,
      name: 'TestPlayer' * 100,
      email: 'testplayer@test.com'
    }, headers: @team1_headers

    assert_response :bad_request
  end

  test 'contestant cannot update team player email too long' do
    post url_for(controller: 'api/contestants', action: 'update_player'), params: {
      id: players(:player2).id,
      name: 'TestPlayer',
      email: "testplayer@#{'test.com' * 100}"
    }, headers: @team1_headers

    assert_response :bad_request
  end

  test "contestant cannot update 'Team Effort' player" do
    post url_for(controller: 'api/contestants', action: 'update_player'), params: {
      id: players(:player1).id,
      name: 'TestPlayer',
      email: 'testplayer@test.com'
    }, headers: @team1_headers

    assert_response :forbidden
  end

  test "contestant cannot update player name to 'Team Effort'" do
    post url_for(controller: 'api/contestants', action: 'update_player'), params: {
      id: players(:player2).id,
      name: 'Team Effort',
      email: 'testplayer@test.com'
    }, headers: @team1_headers

    assert_response :bad_request
  end

  test 'contestant update wrong team player' do
    post url_for(controller: 'api/contestants', action: 'update_player'), params: {
      id: players(:player6).id,
      name: 'TestPlayer',
      email: 'testplayer@test.com'
    }, headers: @team1_headers

    assert_response :forbidden
  end

  test 'contestant update team password' do
    post url_for(controller: 'api/contestants', action: 'change_password'), params: {
      id: users(:user2).id, # User ID not team id
      password: 'newpassword'
    }, headers: @team1_headers

    assert_response :success
    user = User.find(users(:user2).id)
    assert user.password == User.passhash('newpassword')
  end

  test 'contestant cannot update unknown user password' do
    post url_for(controller: 'api/contestants', action: 'change_password'), params: {
      id: 999,
      password: 'newpassword'
    }, headers: @team1_headers

    assert_response :bad_request
  end

  test 'contestant cannot update another user password' do
    post url_for(controller: 'api/contestants', action: 'change_password'), params: {
      id: users(:user3).id,
      password: 'newpassword'
    }, headers: @team1_headers

    assert_response :forbidden
  end
end
