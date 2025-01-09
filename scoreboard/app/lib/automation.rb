KEY_AUTOMATED = "automated"
KEY_GAMESTATE = "game_state"
KEY_GAMEID = "game_id"
KEY_GAMEDURATION = "game_duration"
KEY_REDTEAM = "game_red_team"
KEY_BLUETEAM = "game_blue_team"
KEY_STARTTIME = "start_time"
KEY_MYTIME = "mytime"
KEY_PID = "pid"
KEY_LOCKEDPUZZLES = "locked_puzzles"

class Automation
  include Singleton
  include ActiveModel::Serializers::JSON

  GAME_STATES = ActiveSupport::HashWithIndifferentAccess.new(
    'inactive': 0,
    'prepped': 1,
    'running': 2
  )

  # GETTERs and SETTERs
  def automated
    value = @redis.get(KEY_AUTOMATED).to_i
    if value == 1
      return true
    else
      return false
    end
  end

  def automated=(automated)
    if automated
      @redis.set(KEY_AUTOMATED, 1)
    else
      @redis.set(KEY_AUTOMATED, 0)
    end
  end

  def game_state
    value = @redis.get(KEY_GAMESTATE).to_i

    if Automation::GAME_STATES.key(value).nil?
      return Automation::GAME_STATES[0]
    else
      return Automation::GAME_STATES.key(value)
    end
  end

  def game_state=(game_state)
    if Automation::GAME_STATES[game_state].nil?
      raise TypeError.new("invalid state")
    else
      @redis.set(KEY_GAMESTATE, Automation::GAME_STATES[game_state])
    end
  end

  def start_time
    value = @redis.get(KEY_STARTTIME).to_i
    if value.nil?
      return 0
    else
      return value
    end
  end

  def start_time=(start_time)
    @redis.set(KEY_STARTTIME, start_time)
  end

  def mytime
    value = @redis.get(KEY_MYTIME).to_i
    if value.nil?
      return 0
    else
      return value
    end
  end

  def mytime=(mytime)
    @redis.set(KEY_MYTIME, mytime)
  end

  def pid
    value = @redis.get(KEY_PID).to_i
    if value.nil?
      return 0
    else
      return value
    end
  end

  def pid=(pid)
    @redis.set(KEY_PID, pid)
  end

  def locked_puzzles
    puzzles = @redis.smembers(KEY_LOCKEDPUZZLES)
  end

  def locked_puzzles=(locked_puzzles)
    @redis.del(KEY_LOCKEDPUZZLES)
    if locked_puzzles.length > 0
      @redis.sadd(KEY_LOCKEDPUZZLES, locked_puzzles)
    end
  end

  def game_id
    value = @redis.get(KEY_GAMEID)
    if value.nil?
      return ""
    else
      return value
    end
  end

  def game_id=(game_id)
    @redis.set(KEY_GAMEID, game_id)
  end

  def game_duration
    value = @redis.get(KEY_GAMEDURATION).to_i
    if value.nil?
      return 0
    else
      return value
    end
  end

  def game_duration=(game_duration)
    @redis.set(KEY_GAMEDURATION, game_duration)
  end

  def red_team
    value = @redis.get(KEY_REDTEAM)
    if value.nil?
      return ""
    else
      return value
    end
  end

  def red_team=(red_team)
    @redis.set(KEY_REDTEAM, red_team)
  end

  def blue_team
    value = @redis.get(KEY_BLUETEAM)
    if value.nil?
      return ""
    else
      return value
    end
  end

  def blue_team=(blue_team)
    @redis.set(KEY_BLUETEAM, blue_team)
  end

  # Will get automatically called first time singleton is called "Automation.instance"
  def initialize()
    @redis = RedisClient.instance.client
  end

  def reset()
    @redis.set(KEY_AUTOMATED, 1)
    @redis.set(KEY_GAMESTATE, GAME_STATES['inactive'])
    @redis.set(KEY_STARTTIME, 0)
    @redis.set(KEY_MYTIME, 0)
    @redis.set(KEY_PID, 0)
    @redis.set(KEY_GAMEID, "")
    @redis.set(KEY_GAMEDURATION, 0)
    @redis.set(KEY_REDTEAM, "")
    @redis.set(KEY_BLUETEAM, "")
    @redis.del(KEY_LOCKEDPUZZLES)
  end

  # For ActiveModel::Serializers::JSON, requires Hash with accessors as keys
  def attributes
    {
      "automated" => self.automated,
      "game_state" => self.game_state,
      "start_time" => self.start_time,
      "mytime" => self.mytime,
      "pid" => self.pid,
      "game_duration" => self.game_duration,
      "game_id" => self.game_id,
      "red_team" => self.red_team,
      "blue_team" => self.blue_team,
      "locked_puzzles" => self.locked_puzzles,
    }
  end

  # Convenience Methods

  def is_automated?
    return self.automated
  end

  def automated?
    return self.automated
  end

  # active indicates a game is ongoing
  def is_active?()
    if !self.is_automated?()
      return false
    end

    return self.game_state == "running"
  end

  def add_locked_puzzle(puzzle)
    @redis.sadd(KEY_LOCKEDPUZZLES, puzzle)
  end

  def remove_locked_puzzles(locked_puzzles)
    if locked_puzzles.length > 0
      @redis.srem(KEY_LOCKEDPUZZLES, locked_puzzles)
    end
  end

  def removed_locked_puzzle(puzzle)
    self.remove_locked_puzzles([puzzle])
  end

  def start_round(timestamp, puzzle_list = [])
    if !self.is_automated?
      return
    end

    self.game_state = "running"
    self.start_time = timestamp
    self.mytime = Time.now.to_i
    self.locked_puzzles = puzzle_list
  end

  # Return the minutes that have passed in the game since round_start
  def get_gametime()
    if !self.is_automated?() || self.game_state != "running"
      return 0
    end

    start_time = self.mytime
    current_time = Time.now.to_i
    gametime = current_time - start_time

    return (gametime / 60).to_i # return in minutes
  end

  def stop_round()
    self.game_state = "inactive"
    self.start_time = 0
    self.mytime = 0
    self.locked_puzzles = []
  end
end
