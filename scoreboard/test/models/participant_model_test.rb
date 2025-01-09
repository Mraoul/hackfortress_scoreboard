# frozen_string_literal: true

require 'test_helper'

class ParticipantTest < ActiveSupport::TestCase
  setup do
    @participant = Participant.find(participants(:participant1).id)
    @participant.send(:create_inventories)
    @participant.inventories.each do |inventory|
      inventory.send(:initialize_count)
    end
  end

  test 'has team' do
    assert @participant.team.id
  end

  test 'requires color' do
    participant = Participant.new
    assert_not participant.valid?
    assert_not participant.save
  end

  test 'create inventory on create' do
    participant = Participant.create(color: 'red')
    assert_not_empty participant.inventories
  end

  test 'red team number equals 1' do
    assert_equal 1, Game.with_live.instance.live.red_participant.team_number
  end

  test 'blue team number equals 2' do
    assert_equal 2, Game.with_live.instance.live.blue_participant.team_number
  end

  test 'get inventory_of for participant' do
    item = Item.find(items(:item20).id)
    inventory = @participant.inventory_of(item)
    assert inventory.quantity.positive?
    assert_equal @participant, inventory.participant
  end

  test 'get inventory_of for participant eager' do
    item = Item.find(items(:item20).id)
    inventory = @participant.inventory_of(item, true)
    assert inventory.quantity.positive?
    assert_equal @participant, inventory.participant
  end

  test 'get store down when store not down' do
    assert_not @participant.store_down?
    assert @participant.store_return_seconds.zero?
  end

  test 'get store down when store is down' do
    @participant.store_status = 10.seconds.from_now
    @participant.save!
    assert @participant.store_down?
    assert @participant.store_return_seconds.positive?
  end

  test 'get store down when store was previously down' do
    @participant.store_status = Time.now.to_i - 1
    @participant.save!
    assert @participant.store_return_seconds.zero?
    assert_not @participant.store_down?
    assert @participant.store_return_seconds.zero?
  end
end
