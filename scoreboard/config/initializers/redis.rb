$redis_ping = Redis.new(host: "localhost", port: 6379)
ping_thread = Thread.new do
  while true
    $redis_ping.publish("ping", "!")
    sleep 5.seconds
  end
end

at_exit do
  ping_thread.kill
  $redis_ping.quit
end

class RedisClient
  include Singleton

  def client
    db = Rails.application.config.x.redis[:db] || 0
    @_client ||= Redis.new(host: "localhost", port: 6379, db: db)
  end
end
