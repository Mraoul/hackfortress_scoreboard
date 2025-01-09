module MgmtServices::GameServices
  class GameStarter < ApplicationService
    def call
      HFComms.notify_time_event(
        HFComms::GameStartMessage.new
      )
    end
  end

  class GameEnder < ApplicationService
    def call
      HFComms.notify_time_event(
        HFComms::GameEndMessage.new
      )
    end
  end

  class PuzzleUnlocker < ApplicationService
    def initialize(gametime)
      @gametime = gametime
    end

    def call
      locked_list = Automation.instance.locked_puzzles
      return unless locked_list.length > 0

      Rails.logger.info "Unlocking Puzzles #{@gametime}"

      locked_puzzles = Puzzle.where(id: locked_list, unlock: ..@gametime)
      to_remove = []
      locked_puzzles.each do |locked_puzzle|
        RedisPublisher.publish_updates(
          RedisPublisher::UnlockMessage.new(
            locked_puzzle.id,
            locked_puzzle.name,
            locked_puzzle.data,
            locked_puzzle.points,
            locked_puzzle.description,
            locked_puzzle.author,
            locked_puzzle.data_source
          )
        )
        to_remove.push(locked_puzzle.id)
      end
      Automation.instance.remove_locked_puzzles(to_remove)
    end
  end

  class BonusGranter < ApplicationService
    def initialize(participant, bonus_value)
      @participant = participant
      @bonus_value = bonus_value
    end

    def call
      comms_queue = HFComms::Queue.new
      redis_queue = RedisPublisher::Queue.new

      response = nil
      @participant.with_lock do
        @participant.bonus_score += @bonus_value
        redis_queue.queue_dashboard_update_to(
          @participant.color,
          RedisPublisher::UpdateBonusScoreMessage.new(
            @bonus_value
          )
        )

        comms_queue.queue_hack_event(
          HFComms::BonusEventMessage.new(
            @participant.team_number,
            'Judge Bonus',
            @bonus_value
          ),
          3 # delay of 3 seconds
        )

        response = { json: { "error": 'Unable to save bonus' }, status: :unprocessable_entity } unless @participant.save
      end

      redis_queue.send if response.nil?
      comms_queue.send if response.nil?

      response
    end
  end

  class ParticipantPatcher < ApplicationService
    def initialize(participant, mods)
      @participant = participant
      @mods = mods
    end

    def call
      comms_queue = HFComms::Queue.new
      redis_queue = RedisPublisher::Queue.new

      response = nil
      @participant.with_lock do
        @mods.each do |name, value|
          numeric_value = value.to_i
          next if numeric_value.zero?

          field_name = name.delete_suffix('_mod')
          new_value = @participant.send(field_name) + numeric_value
          new_value = 0 if new_value.negative?

          @participant.update_attribute(field_name, new_value)

          case field_name
          when 'hints'
            redis_queue.queue_update_to(
              @participant.color,
              RedisPublisher::HintMessage.new(
                @participant.color,
                numeric_value
              )
            )
          when 'hack_score'
            redis_queue.queue_dashboard_update_to(
              @participant.color,
              RedisPublisher::UpdateHackScoreMessage.new(
                numeric_value
              )
            )
          when 'bonus_score'
            redis_queue.queue_dashboard_update_to(
              @participant.color,
              RedisPublisher::UpdateBonusScoreMessage.new(
                numeric_value
              )
            )
            comms_queue.queue_hack_event(
              HFComms::BonusEventMessage.new(
                @participant.team_number,
                'Judge Bonus',
                numeric_value
              ),
              3 # delay of 3 seconds
            )
          when 'tf2_score'
            redis_queue.queue_dashboard_update_to(
              @participant.color,
              RedisPublisher::UpdateTF2ScoreMessage.new(
                numeric_value
              )
            )
          end
        end

        response = { json: { "errors": @participant.errors }, status: :unprocessable_entity } unless @participant.save
      end

      redis_queue.send
      comms_queue.send
      response
    end
  end
end
