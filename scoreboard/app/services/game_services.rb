# frozen_string_literal: true

module GameServices
  class CapDelayAdder < ApplicationService
    MAX_CAP_DELAY = 2

    def initialize(participant, chance = 100)
      @participant = participant
      @chance = chance
      super()
    end

    def call
      random_number = rand(1..100)
      num_current = @participant.statuses.where(status_type: Status::Status_values['CAP_DELAY']).count

      return false unless num_current < MAX_CAP_DELAY && random_number <= @chance

      duration = 86_400
      status = Status.create(status_type: Status::Status_values['CAP_DELAY'], duration: duration,
                             participant_id: @participant.id, endtime: Time.now.to_i + duration)

      return false if status.nil?

      publish_updates(duration, status)
      status
    end

    private

    def publish_updates(_duration, _status)
      HFComms.notify_status_effect(
        HFComms::StatusEffectMessage.new(
          @participant.team_number,
          'cap_delay',
          false,
          0,
          false
        )
      )
    end
  end

  class CapDelayRemover < ApplicationService
    def initialize(participant)
      @participant = participant
      super()
    end

    def call
      status = @participant.statuses.where(status_type: Status::Status_values['CAP_DELAY']).first

      return false if status.nil?

      endtime = status.endtime
      status.destroy
      publish_updates(endtime)
      true
    end

    private

    def publish_updates(_endtime)
      HFComms.notify_status_effect(
        HFComms::StatusEffectMessage.new(
          @participant.team_number,
          'cap_delay',
          false,
          0,
          true
        )
      )
    end
  end

  class CapBlockAdder < ApplicationService
    def initialize(participant, duration = 60)
      @participant = participant
      @duration = duration
      super()
    end

    def call
      @participant.parse_statuses # To get rid of stale cap blocks
      num_current = @participant.statuses.where(status_type: Status::Status_values['CAP_BLOCK']).count

      return false if num_current >= 1 # Maximum of one cap block at any given time

      status = Status.create(status_type: Status::Status_values['CAP_BLOCK'], duration: @duration,
                             participant_id: @participant.id, endtime: Time.now.to_i + @duration)

      return false if status.nil?

      publish_updates(@duration, status)
      status
    end

    private

    def publish_updates(duration, _status)
      HFComms.notify_status_effect(
        HFComms::StatusEffectMessage.new(
          @participant.team_number,
          'cap_block',
          true,
          duration,
          false
        )
      )
    end
  end

  class CapBlockRemover < ApplicationService
    def initialize(participant)
      @participant = participant
      super()
    end

    def call
      @participant.parse_statuses # To get rid of stale cap blocks
      status = @participant.statuses.where(status_type: Status::Status_values['CAP_BLOCK']).first

      return false if status.nil?

      endtime = status.endtime
      status.destroy
      publish_updates(endtime)
      true
    end

    private

    def publish_updates(_endtime)
      HFComms.notify_status_effect(
        HFComms::StatusEffectMessage.new(
          @participant.team_number,
          'cap_block',
          true,
          0,
          true
        )
      )
    end
  end
end
