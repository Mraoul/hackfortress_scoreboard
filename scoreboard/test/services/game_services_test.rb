# frozen_string_literal: true

require 'test_helper'

class GameServicesTest < ActionDispatch::IntegrationTest
  setup do
    @round = Game.with_live.instance.live
    @participant = @round.red_participant
  end

  test 'add cap delay once' do
    status = GameServices::CapDelayAdder.call(@participant)
    assert status.duration
  end

  test "can't add cap delay thrice" do
    2.times do
      status = GameServices::CapDelayAdder.call(@participant)
      assert status.duration
    end

    status = GameServices::CapDelayAdder.call(@participant)
    assert_not status
  end

  test 'remove cap delay' do
    status = GameServices::CapDelayAdder.call(@participant)
    assert status

    assert GameServices::CapDelayRemover.call(@participant)
  end

  test "can't remove non-existant cap delay" do
    assert_not GameServices::CapDelayRemover.call(@participant)
  end

  test 'add cap block once' do
    status = GameServices::CapBlockAdder.call(@participant, 0)  # 0 delay for testing
    assert status.duration.zero?
  end

  test "can't add cap block twice" do
    status = GameServices::CapBlockAdder.call(@participant, 10)
    assert status.duration

    assert_not GameServices::CapBlockAdder.call(@participant)
  end

  test 'stale cap blocks removed before adding' do
    assert GameServices::CapBlockAdder.call(@participant, -1)
    assert GameServices::CapBlockAdder.call(@participant, 1)
  end

  test 'remove existing cap block' do
    assert GameServices::CapBlockAdder.call(@participant, 60)
    assert GameServices::CapBlockRemover.call(@participant)
  end

  test "can't remove non-existant cap block" do
    assert_not GameServices::CapBlockRemover.call(@participant)
  end
end
