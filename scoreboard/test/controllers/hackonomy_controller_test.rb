# frozen_string_literal: true

require 'test_helper'
require 'controllers/base_controller_test'

class HackonomyControllerTest < BaseControllerTest
  setup do
    @round = Game.with_live.instance.live
    @participant = @round.red_participant
    Item.all.each do |item|
      Inventory.find_or_create_by(participant_id: @participant.id, item_id: item.id)
    end
    @participant.tf2coins = 1000
    @participant.hackcoins = 1000
    @participant.save!
    @hack_item = Item.find(items(:item20).id)
    @tf2_item = Item.find(items(:item1).id)
  end

  test 'contestant purchases hack item' do
    post url_for(controller: '/api/hackonomy', action: 'purchase_item'), params: {
      team: @participant.id,
      item: @hack_item.id
    }, headers: @team1_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert json_response['stock'].positive?
  end

  test "contestant can't purchases out of stock" do
    inventory = @participant.inventory_of(@hack_item)
    inventory.quantity = 0
    inventory.save!

    post url_for(controller: '/api/hackonomy', action: 'purchase_item'), params: {
      team: @participant.id,
      item: @hack_item.id
    }, headers: @team1_headers

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert json_response['reason'] == 'no_stock'
  end

  test "contestant can't purchases no funds" do
    @participant.hackcoins = 0
    @participant.save!

    post url_for(controller: '/api/hackonomy', action: 'purchase_item'), params: {
      team: @participant.id,
      item: @hack_item.id
    }, headers: @team1_headers

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert json_response['reason'] == 'low_funds'
  end

  test 'color not required to display store' do
    get url_for(controller: '/api/hackonomy', action: 'storefront', color: 'None'), params: {}, headers: @team1_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert json_response['store']['status'] == 'up'
    assert_not_empty json_response['items']['hack']
    assert_not_empty json_response['items']['tf2']
  end

  test 'contestant requests storefront' do
    get url_for(controller: '/api/hackonomy', action: 'storefront', color: 'red'), params: {}, headers: @team1_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert json_response['store']['status'] == 'up'
    assert_not_empty json_response['items']['hack']
    assert_not_empty json_response['items']['tf2']
  end

  test 'contestant requests storefront while down' do
    @participant.store_status = Time.now.to_i + 60
    @participant.save!

    get url_for(controller: '/api/hackonomy', action: 'storefront', color: 'red'), params: {}, headers: @team1_headers

    assert_response :success
    json_response = JSON.parse(response.body)
    assert json_response['store']['status'] == 'down'
  end
end
