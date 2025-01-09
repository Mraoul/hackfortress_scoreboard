# frozen_string_literal: true

require "sneakers"
require "json"
require "msgpack"

# TF2 worker
class Tf2Worker
  include Sneakers::Worker
  include RedisPublisher

  Rails.logger.info "Starting TF2 Worker for Rails Env: #{Rails.env}"

  POINT_VALUES = {
    "first_blood" => 5,
    "domination" => 5,
    "revenge" => 5,
    "point_captured" => 5,
    "kill" => 1,
    "round_win" => 25
  }.freeze

  from_queue "hack_scoreboard",
    routing_key: ["tf2.event.time", "tf2.event.score"]

  def heartbeat
    Rails.logger.info "Heartbeater Starting"
    stop = false

    Signal.trap("TERM") do
      stop = true
    end

    Signal.trap("INT") do
      stop = true
    end

    begin
      last_check = 0
      until stop
        gametime = Automation.instance.get_gametime
        if gametime.positive? && (gametime % 5).zero? && (gametime > last_check)
          MgmtServices::GameServices::PuzzleUnlocker.call(gametime)
          last_check = gametime
        end
        sleep(1)
      end
    rescue StandardError => e
      Rails.logger.info "Exception in HeartBeat: #{e}"
    end

    Rails.logger.info "Heartbeater Stopping"
  end

  def work(msg)
    message = MessagePack.unpack(msg)
    Rails.logger.info "Worker Received: #{message}"

    case message["event"]
    when "game_prep"
      handle_game_prep(message)
    when "game_start"
      handle_game_start(message)
    # when 'game_update'
    # when 'game_time_change'
    when "game_end"
      handle_game_end(message)
    else
      handle_score_event(message)
    end

    ack!
  end

  private

  def spawn_heartbeater
    p1 = fork do
      heartbeat
    end
    Rails.logger.info "Process ID: #{p1}"
    Process.detach(p1)
    p1
  end

  def kill_heartbeater(pid)
    Rails.logger.info "Stored PID: #{pid}"
    if pid != 0
      begin
        Process.kill("TERM", pid)
      rescue StandardError => e
        Rails.logger.info "Exception while trying to kill process #{pid}: #{e}"
      end
      Automation.instance.pid = 0
    else
      Rails.logger.info "PID equal to 0"
    end
  end

  def handle_game_prep(message)
    return unless Automation.instance.is_automated?

    begin
      Automation.instance.game_state = "prepped"
      Automation.instance.game_id = message["game_id"]
      Automation.instance.game_duration = message["duration"]
      Automation.instance.red_team = message["red_team"]
      Automation.instance.blue_team = message["blue_team"]
    rescue StandardError => e
      Rails.logger.error "Exception: #{e}"
      Rails.logger.error e.backtrace.join("\n")
    end

    begin
      cats = Game.with_ready.instance.ready.puzzleset.category_names
      out_message = {}
      out_message[:event] = "game_prepped"
      out_message[:categories] = cats.to_a

      Thread.new do
        Rails.logger.info "Sending Categories to MQ"
        $rabbitmq_channel.basic_publish(MessagePack.pack(out_message), "hackfortress",
          "hack.event.time")
      end
    rescue StandardError => e
      Rails.logger.error "Exception: #{e}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end

  def handle_game_start(message)
    if Automation.instance.is_automated?
      begin
        lp_list = []
        puzzles = Game.with_ready.instance.ready.puzzleset.puzzles
        if puzzles.nil?
          Rails.logger.warn "Can't start a game with no Round/Puzzles!"
        else
          puzzles.each do |puzzle|
            lp_list.append(puzzle.id) if puzzle.unlock.positive?
          end
          Rails.logger.info "Priming TF2 Structure"
          Automation.instance.start_round(message["timestamp"].to_i, lp_list)
          Rails.logger.info "Starting Round"
          Game.instance.start

          Automation.instance.pid = spawn_heartbeater

          begin
            out_message = {}
            out_message[:event] = "game_started"

            Thread.new do
              Rails.logger.info "Sending Game Started to MQ"
              $rabbitmq_channel.basic_publish(MessagePack.pack(out_message), "hackfortress",
                "hack.event.time")
            end
          rescue StandardError => e
            Rails.logger.error "Exception: #{e}"
            Rails.logger.error e.backtrace.join("\n")
          end
        end
      rescue StandardError => e
        Rails.logger.error "Exception: #{e}"
        Rails.logger.error e.backtrace.join("\n")
      end
    else
      Rails.logger.warn "Received game_start while automation is disabled"
    end
  end

  def handle_game_end(_message)
    return unless Automation.instance.is_automated?

    begin
      Rails.logger.info "Stopping Round"
      Automation.instance.stop_round
      Game.instance.stop

      pid = Automation.instance.pid
      kill_heartbeater(pid)
    rescue StandardError => e
      Rails.logger.error "Exception: #{e}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end

  def handle_score_event(message)
    team_num = message["team"]
    event = message["event"]
    response = {}

    active_round = Game.instance.live

    if active_round.nil?
      response["status"] = "error"
      response["errors"] = "no round"
    elsif ![1, 2].include?(team_num)
      response["status"] = "error"
      response["errors"] = "unknown team"
    elsif !POINT_VALUES.include?(event)
      response["status"] = "error"
      response["errors"] = "unknown Event"
    else
      response = { "status" => "ok" }

      value = 0
      if message.key?("value")
        value = message["value"].to_i
      elsif POINT_VALUES.key?(event)
        value = POINT_VALUES[event]
      end

      participant = if team_num == 1
                      active_round.red_participant
                    else
                      active_round.blue_participant
                    end

      participant.with_lock do
        participant.tf2_score += value
        participant.hackcoins += value
        participant.save
      end

      RedisPublisher.publish_dashboard_update_to(
        participant.color,
        RedisPublisher::UpdateTF2ScoreMessage.new(
          value
        )
      )

    end
    Rails.logger.info "Response: #{response}"
  end
end
