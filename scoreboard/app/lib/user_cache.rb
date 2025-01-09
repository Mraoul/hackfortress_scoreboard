CACHE_PREFIX = "UC_"

class UserCache
  attr_reader :id, :username, :role, :team

  def initialize(user_inst: nil, user_hash: nil)
    if !user_inst.nil?
      @id = user_inst.id
      @username = user_inst.username
      @role = user_inst.role
      @team = user_inst.team.nil? ? nil : TeamCache.new(team_inst: user_inst.team)
    elsif !user_hash.nil?
      @id = user_hash["id"]
      @username = user_hash["username"]
      @role = user_hash["role"]
      @team = user_hash["team"].nil? ? nil : TeamCache.new(team_hash: user_hash["team"])
    else
      raise "Must provide either a user instance or a hash"
    end
  end

  def self.clear_cache_of(user_id)
    cache_key = "#{CACHE_PREFIX}#{user_id.to_s}"
    RedisClient.instance.client.del(cache_key)
  end

  def self.find_or_create_by(user_id)
    cache_key = "#{CACHE_PREFIX}#{user_id.to_s}"
    user_cache = RedisClient.instance.client.get(cache_key)
    if user_cache.nil?
      user = User.includes(:team).find(user_id)
      user_cache = UserCache.new(user_inst: user)
      cache_data = user_cache.to_json
      RedisClient.instance.client.set(cache_key, cache_data, exat: 5.minutes.from_now.to_i)
      return user_cache
    else
      user_hash = JSON.parse(user_cache)
      return UserCache.new(user_hash: user_hash)
    end
  end
end

class TeamCache
  attr_reader :id, :name

  def initialize(team_inst: nil, team_hash: nil)
    if !team_inst.nil?
      @id = team_inst.id
      @name = team_inst.name
    elsif !team_hash.nil?
      @id = team_hash["id"]
      @name = team_hash["name"]
    else
      raise "Must provide either a team instance or a hash"
    end
  end
end
