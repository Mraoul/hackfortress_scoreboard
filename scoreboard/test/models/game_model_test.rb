# frozen_string_literal: true

require 'test_helper'

class GameTest < ActiveSupport::TestCase
  setup do
    @game = games(:game1)
  end

  test "can't create second game" do
    assert_not Game.new(singleton_guard: 0).save
  end

  test 'get live round' do
    assert @game.live.id == rounds(:round1).id
  end

  test 'get instance' do
    assert Game.instance == @game
  end

  test 'start game' do
    game = Game.instance
    game.live = nil
    game.save!

    game.start
    assert_equal game.ready, game.live
  end

  test 'start game when not ready' do
    game = Game.instance
    game.ready = nil
    game.save!

    game.start
  end

  test 'stop game' do
    game = Game.instance
    game.live = Round.find(rounds(:round1).id)
    game.save!

    game.stop
    assert_nil game.live
  end

  test 'stop game when not running' do
    game = Game.instance
    game.live = nil
    game.save!

    game.stop
  end
end
