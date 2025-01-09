require "bundler/setup"
require "rack"
require 'sinatra'
require 'redis'


class SinatraStreaming < Sinatra::Base
  #set :environment, :production

  def handleStream(subscribe_channel, event_name)
    content_type 'text/event-stream'
    stream(:keep_open) do |out|
      begin
        redis = Redis.new
        redis.subscribe([subscribe_channel, 'ping']) do |on|
          on.message do |channel, message|
            logger.info "Message on channel #{channel}, #{message}\n"
            if channel == 'ping'
              if message == 'die'
                break
              else
                out << "\0"
              end
            else
              out << "\n"
              out << "event: #{event_name}\n"
              out << "retry: 300\n"
              out << "data: #{message.to_s}\n\n"
            end
          end
        end
      rescue IOError
          logger.info "IOError\n"
      rescue StandardError => e
          logger.info "Error: #{e}, #{e.class}"
      ensure
          logger.info "Ensure Block"
      end
    end
  end

  def colorCheck(color)
    if !['red', 'blue'].include?(color)
      status 400
      body "Invalid color specified"
      return false
    else
      return true
    end
  end

  get '/stream/updates/viewer' do
    self.handleStream('/viewer/updates', 'viewer')
  end

  get '/stream/updates/:color' do |color|
    return if !self.colorCheck(color)
    self.handleStream("/#{color}/updates", "update")
  end

  get '/stream/dashboard/:color' do |color|
    return if !self.colorCheck(color)
    self.handleStream("/#{color}/dashboard", "dashboard")
  end

  get '/stream/wallet/updates/:color' do |color|
    return if !self.colorCheck(color)
    self.handleStream("/#{color}/wallet/updates", "wallet")
  end
end

at_exit do
  print "At Exit\n"
  r = Redis.new
  r.publish('ping', 'die')
  r.quit
end

if __FILE__ == $0
  SinatraStreaming.run!
end

