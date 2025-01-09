# frozen_string_literal: true

require 'test_helper'

class HackonomyServicesTest < ActionDispatch::IntegrationTest
  setup do
    @round = Game.with_live.instance.live
    @participant = @round.red_participant
    Item.all.each do |item|
      Inventory.find_or_create_by(participant_id: @participant.id, item_id: item.id)
    end
    @participant.tf2coins = 1000
    @participant.hackcoins = 1000
    @participant.save!
  end

  test 'red team buys hack item' do
    item = Item.find(items(:item20).id)
    friendly_text, remaining_stock = HackonomyServices::HackonomyPurchaser.call(@round, @participant, item)
    assert friendly_text
    assert remaining_stock.positive?
    assert @participant.hackcoins < 1000
    assert @participant.hints.positive?
  end

  test 'red team buys tf2 item' do
    item = Item.find(items(:item1).id)
    friendly_text, remaining_stock = HackonomyServices::HackonomyPurchaser.call(@round, @participant, item)
    assert friendly_text
    assert remaining_stock.positive?
    assert @participant.tf2coins < 1000
  end

  test "red team can't buy hack item due to stock" do
    item = Item.find(items(:item20).id)
    inventory = Inventory.where(participant_id: @participant.id, item_id: item.id).first
    inventory.quantity = 0
    inventory.save!
    assert_raises(Exceptions::NoStockError) do
      HackonomyServices::HackonomyPurchaser.call(@round, @participant, item)
    end
    assert_same(1000, @participant.hackcoins)
  end

  test "red team can't buy hack item due to funds" do
    item = Item.find(items(:item20).id)
    @participant.hackcoins = 1
    @participant.save!
    assert_raises(Exceptions::InsufficientFundsError) do
      HackonomyServices::HackonomyPurchaser.call(@round, @participant, item)
    end
    assert_same(1, @participant.hackcoins)
  end
end
