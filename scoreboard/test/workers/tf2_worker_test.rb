# frozen_string_literal: true

require 'test_helper'

class Tf2Test < ActiveSupport::TestCase
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

  test 'handle_game_prep' do
    mock = Minitest::Mock.new
    Thread.stub :new, mock do
      @worker.send(:handle_game_prep,
                   { 'game_id' => 'test', 'duration' => 5, 'red_team' => 'test', 'blue_team' => 'test' })
      assert Automation.instance.game_state == 'prepped'
      assert Automation.instance.game_id == 'test'
      assert Automation.instance.game_duration == 5
    end
  end

  test 'handle_game_start' do
    mock = Minitest::Mock.new

    def @worker.spawn_heartbeater = 999

    Thread.stub :new, mock do
      @worker.send(:handle_game_start, {
                     'timestamp' => Time.now.to_i
                   })

      assert Automation.instance.game_state = 'running'
      assert Automation.instance.pid == 999
    end
  end

  test 'handle_game_end' do
    def @worker.kill_heartbeater = true

    @worker.send(:handle_game_end, {})
    assert Automation.instance.game_state == 'inactive'
  end

  test 'handle_score_event no value provided' do
    mock = Minitest::Mock.new

    RedisPublisher.stub :publish_dashboard_update_to, mock do
      RedisPublisher::UpdateTF2ScoreMessage.stub :new, mock do
        Game.instance.start
        red_team = Game.instance.live.red_participant
        score = red_team.tf2_score
        @worker.send(:handle_score_event,
                     { 'team' => 1, 'event' => 'kill' })
        red_team.reload
        assert red_team.tf2_score > score
      end
    end
  end

  test 'handle_score_event value provided' do
    mock = Minitest::Mock.new

    RedisPublisher.stub :publish_dashboard_update_to, mock do
      RedisPublisher::UpdateTF2ScoreMessage.stub :new, mock do
        Game.instance.start
        blue_team = Game.instance.live.blue_participant
        score = blue_team.tf2_score
        @worker.send(:handle_score_event,
                     { 'team' => 2, 'event' => 'kill', 'value' => '10' })
        blue_team.reload
        assert_equal blue_team.tf2_score, score + 10
      end
    end
  end
end
