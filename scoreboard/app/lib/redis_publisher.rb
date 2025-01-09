module RedisPublisher
  module_function

  def publish_to(channel, message)
    message_str = message.to_json
    Rails.logger.info "Publishing to: #{channel} #{message_str}"
    RedisClient.instance.client.publish(channel, message.to_json)
  rescue Exception => e
    logger.error('Unable to Publish Redis Message: ' + e.to_s)
  end

  def publish_update_to(color, message)
    channel = "/#{color}/updates"
    RedisPublisher.publish_to(channel, message)
  end

  def publish_updates(message)
    %w[red blue].each do |color|
      RedisPublisher.publish_update_to(color, message)
    end
  end

  def publish_dashboard_update_to(color, message)
    channel = "/#{color}/dashboard"
    RedisPublisher.publish_to(channel, message)
  end

  class MessageBase
    def initialize(type)
      @type = type
    end

    def to_hash
      output = {}
      instance_variables.each { |var| output[var.to_s.delete('@')] = instance_variable_get(var) }
      output
    end
  end

  class UpdateHackScoreMessage < MessageBase
    def initialize(hack_score_mod)
      @hack_score_mod = hack_score_mod
      super('update_hack_score')
    end
  end

  class UpdateBonusScoreMessage < MessageBase
    def initialize(bonus_score_mod)
      @bonus_score_mod = bonus_score_mod
      super('update_bonus_score')
    end
  end

  class UpdateTF2ScoreMessage < MessageBase
    def initialize(tf2_score_mod)
      @tf2_score_mod = tf2_score_mod
      super('update_tf2_score')
    end
  end

  class UnlockMessage < MessageBase
    def initialize(puzzle_id, puzzle_name, puzzle_loc, puzzle_points, puzzle_desc, puzzle_author, puzzle_gcloud)
      @puzzle_id = puzzle_id
      @puzzle_name = puzzle_name
      @puzzle_loc = puzzle_loc
      @puzzle_points = puzzle_points
      @puzzle_desc = puzzle_desc
      @puzzle_author = puzzle_author
      @puzzle_gcloud = puzzle_gcloud
      super('unlock')
    end
  end

  class WalletMessage < MessageBase
    def initialize(tf2, hack)
      @tf2 = tf2
      @hack = hack
      super('wallet')
    end
  end

  class SolvedMessage < MessageBase
    def initialize(puzzle, player)
      @puzzle = puzzle
      @player = player
      super('solved')
    end
  end

  class TeamMessageBase < MessageBase
    def initialize(type, team)
      @team = team
      super(type)
    end
  end

  class AddScoreMessage < TeamMessageBase
    def initialize(team, puzzle, value, modifier)
      @puzzle = puzzle
      @value = value
      @modifier = modifier
      super('add_score', team)
    end
  end

  class BonusEventMessage < TeamMessageBase
    def initialize(team, _event, puzzle, value)
      @puzzle = puzzle
      @value = value
      super('bonus_event', team)
    end
  end

  class NotifyMessage < TeamMessageBase
    def initialize(team, event, title, body, soundid)
      @event = event
      @title = title
      @body = body
      @soundid = soundid
      super('notify', team)
    end
  end

  class HintMessage < TeamMessageBase
    def initialize(team, quantity)
      @quantity = quantity
      super('hint', team)
    end
  end

  class StatusAddMessage < TeamMessageBase
    def initialize(team, status, duration = nil, end_ = nil, mytime = nil)
      @status = status
      @duration = duration
      @end = end_
      @mytime = mytime
      super('status_add', team)
    end
  end

  class StatusCapBlockRemoveMessage < TeamMessageBase
    def initialize(team, end_ = nil, mytime = nil)
      @status = 'cap_block'
      @end = end_
      @mytime = mytime
      super('status_remove', team)
    end
  end

  class StatusCapDelayRemoveMessage < TeamMessageBase
    def initialize(team, end_ = nil, mytime = nil)
      @status = 'cap_delay'
      @end = end_
      @mytime = mytime
      super('status_remove', team)
    end
  end

  class Queue
    def initialize
      @messages = []
    end

    def addMessage(channel, msg)
      @messages.append({
                         'channel': channel,
                         'msg': msg
                       })
    end

    def queue_to(channel, message)
      addMessage(channel, message)
    end

    def queue_update_to(color, message)
      channel = "/#{color}/updates"
      addMessage(channel, message)
    end

    def queue_updates(message)
      %w[red blue].each do |color|
        queue_update_to(color, message)
      end
    end

    def queue_dashboard_update_to(color, message)
      channel = "/#{color}/dashboard"
      addMessage(channel, message)
    end

    def send
      @messages.each do |message|
        RedisPublisher.publish_to(
          message[:channel], message[:msg].to_hash
        )
      end
    end
  end
end
