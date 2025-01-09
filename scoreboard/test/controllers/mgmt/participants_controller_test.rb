# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class ParticipantsControllerTest < BaseControllerTest
  test 'index participants' do
    get url_for(controller: '/api/mgmt/participants', action: 'index'), params: {}, headers: @admin_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_instance_of Array, json_response
    assert_includes json_response[0], 'id'
    assert_includes json_response[0], 'color'
  end

  test 'admin bonus grant' do
    participant = participants(:participant1)
    old_bonus = participant.bonus_score
    post url_for(controller: '/api/mgmt/participants', action: 'bonus_grant', id: participant.id), params: {
      bonus_value: 10
    }, headers: @admin_headers

    assert_response :success
    assert JSON.parse(response.body)
    assert_in_delta old_bonus, Participant.find(participant.id).bonus_score, 10
  end

  test "admin can't bonus grant non-numeric" do
    participant = participants(:participant1)
    post url_for(controller: '/api/mgmt/participants', action: 'bonus_grant', id: participant.id), params: {
      bonus_value: 'test'
    }, headers: @admin_headers

    assert_response :bad_request
  end

  test "admin can't bonus grant non-existant participant" do
    post url_for(controller: '/api/mgmt/participants', action: 'bonus_grant', id: 1), params: {
      bonus_value: 10
    }, headers: @admin_headers

    assert_response :bad_request
  end

  test 'admin update participant' do
    participant = participants(:participant1)
    put url_for(controller: '/api/mgmt/participants', action: 'update', id: participant.id), params: {
      participant: {
        hack_score: 1,
        bonus_score: 2,
        tf2_score: 3,
        hackcoins: 4,
        tf2coins: 5
      }
    }, headers: @admin_headers

    assert_response :success
    participant = Participant.find(participant.id)
    assert participant.hack_score == 1
    assert participant.bonus_score == 2
    assert participant.tf2_score == 3
    assert participant.hackcoins == 4
    assert participant.tf2coins == 5
  end

  test 'admin patch participant only mods' do
    orig_participant = participants(:participant1)
    patch url_for(controller: '/api/mgmt/participants', action: 'patch', id: orig_participant.id), params: {
      hack_score_mod: 1,
      bonus_score_mod: 1,
      tf2_score_mod: 1,
      hackcoins_mod: 1,
      tf2coins_mod: 1
    }, headers: @admin_headers

    assert_response :success
    participant = Participant.find(orig_participant.id)
    assert_in_delta orig_participant.hack_score, participant.hack_score, 1
    assert_in_delta orig_participant.bonus_score, participant.bonus_score, 1
    assert_in_delta orig_participant.tf2_score, participant.tf2_score, 1
    assert_in_delta orig_participant.hackcoins, participant.hackcoins, 1
    assert_in_delta orig_participant.tf2coins, participant.tf2coins, 1
  end
end
