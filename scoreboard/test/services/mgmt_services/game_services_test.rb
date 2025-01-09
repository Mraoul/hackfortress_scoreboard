# frozen_string_literal: true

require 'test_helper'

class GameServicesTest < ActionDispatch::IntegrationTest
  include RedisPublisher

  setup do
    Automation.instance.automated = true
    Game.instance.ready_round_id = Round.find(rounds(:round1).id)
    Game.instance.save
    @worker = Tf2Worker.new
  end

  teardown do
    Automation.instance.reset
  end

  test 'game start' do
    def HFComms.notify_time_event(event)
      raise StandardError unless event.instance_of?(HFComms::GameStartMessage)
    end

    MgmtServices::GameServices::GameStarter.call
  end

  test 'game end' do
    def HFComms.notify_time_event(event)
      raise StandardError unless event.instance_of?(HFComms::GameEndMessage)
    end

    MgmtServices::GameServices::GameEnder.call
  end

  test 'puzzle unlocker game running' do
    # Setup copied from tf2_worker_test.rb
    mock = Minitest::Mock.new
    def @worker.spawn_heartbeater = 999
    Thread.stub :new, mock do
      @worker.send(:handle_game_prep,
                   { 'game_id' => 'test', 'duration' => 5, 'red_team' => 'test', 'blue_team' => 'test' })
      @worker.send(:handle_game_start, { 'timestamp' => Time.now.to_i })
      locked_puzzles = Automation.instance.locked_puzzles
      MgmtServices::GameServices::PuzzleUnlocker.call(5)
      assert_not_equal Automation.instance.locked_puzzles, locked_puzzles
    end
  end

  test 'puzzle unlocker no game' do
    MgmtServices::GameServices::PuzzleUnlocker.call(5)
  end
end
