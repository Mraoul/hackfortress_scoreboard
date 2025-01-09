# frozen_string_literal: true

require 'msgpack'

module HFComms
  module_function

  def notify_message(exchange, routing_key, message, delay = 0)
    Rails.logger.debug("Sending message #{message.to_hash.to_s}")
    notify = Thread.new do
      sleep delay
      Rails.logger.info "Sending #{routing_key} message to rabbit"
      $rabbitmq_channel.basic_publish(
        MessagePack.pack(message.to_hash), exchange, routing_key
      )
    end
  end

  module_function

  def notify_hack_event(message, delay = 0)
    notify_message(
      "hackfortress", "hack.event.score", message, delay
    )
  end

  module_function

  def notify_tf2_effect(message)
    notify_message(
      "hackfortress", "purchase.effect.tf2", message
    )
  end

  module_function

  def notify_hack_effect(message)
    notify_message(
      "hackfortress", "purchase.effect.hack", message
    )
  end

  module_function

  def notify_time_event(message)
    notify_message(
      "hackfortress", "tf2.event.time", message
    )
  end

  module_function

  def notify_status_effect(message)
    notify_message(
      "hackfortress", "status.effect", message
    )
  end

  class MessageBase
    def initialize
    end

    def to_hash
      output = Hash.new
      instance_variables.each { |var| output[var.to_s.delete("@")] = instance_variable_get(var) }
      return output
    end
  end

  class StatusEffectMessage < MessageBase
    def initialize(team, status_name, timed, timer, remove)
      @team = team
      @status_name = status_name
      @timed = timed
      @timer = timer
      @remove = remove
      super()
    end
  end

  class GameStartMessage < MessageBase
    def initialize()
      @event = "game_start"
      @timestamp = Time.now.to_i
      super()
    end
  end

  class GameEndMessage < MessageBase
    def initialize
      @event = "game_end"
      super()
    end
  end

  class HackEventMessage < MessageBase
    def initialize(team, category, name, value, player = nil)
      @type = 'hack'
      @team = team
      @value = value
      @category = category
      @name = name
      @player = player
      super()
    end
  end

  class BonusEventMessage < MessageBase
    def initialize(team, bonus, value)
      @type = 'bonus'
      @team = team
      @value = value
      @bonus = bonus
      super()
    end
  end

  class TF2EffectMessage < MessageBase
    def initialize(from_team, to_team, num_players, modifier, effect_name, delay, cost)
      @from_team = from_team
      @to_team = to_team
      @num_players = num_players
      @value = modifier
      @effect_name = effect_name
      @delay = delay
      @cost = cost
      super()
    end
  end

  class HackEffectMessage < MessageBase
    def initialize(effect_name, from_team, to_team, cost)
      @effect_name = effect_name
      @from_team = from_team
      @to_team = to_team
      @cost = cost
      super()
    end
  end

  class Queue
    def initialize
      @messages = []
    end

    def addMessage(routing_key, message, delay = 0)
      exchange = "hackfortress"
      @messages.append({
                         "exchange": exchange,
                         "routing_key": routing_key,
                         "message": message,
                         "delay": delay
                       })
    end

    def queue_hack_event(message, delay = 0)
      addMessage("hack.event.score", message, delay)
    end

    def queue_tf2_effect(message)
      addMessage("purchase.effect.tf2", message)
    end

    def queue_hack_effect(message)
      addMessage("purchase.effect.hack", message)
    end

    def send
      @messages.each do |message|
        HFComms.notify_message(
          message[:exchange],
          message[:routing_key],
          message[:message],
          message[:delay]
        )
      end
    end
  end
end
