# frozen_string_literal: true

class JsonWebToken
  SECRET_KEY = Rails.application.credentials.dig(Rails.env.to_sym, :secret_key_base).to_s
  EXPIRED_TOKEN_PREFIX = 'EXP_'
  ACTIVE_TOKEN_PREFIX = 'TOK_'

  def self.token_string(payload)
    "#{ACTIVE_TOKEN_PREFIX}#{payload['username']}_#{payload['exp']}"
  end

  def self.generate(user, expire_time = 12.hours.from_now)
    payload = {
      iat: Time.now.to_i,
      exp: expire_time.to_i,
      user_id: user.id,
      username: user.username
    }
    token = encode(payload)
    RedisClient.instance.client.set("#{ACTIVE_TOKEN_PREFIX}#{user.username}_#{expire_time.to_i}", token,
                                    exat: expire_time.to_i)
    token
  end

  def self.encode(payload)
    Rails.logger.info "JWT PAYLOAD: #{payload}"
    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  def self.get_token(request)
    # Syntax is "Bearer <token>"
    token = request.headers['Authorization']
    token = token.split(' ').last if token
    token
  end

  def self.decode_request(request)
    token = get_token(request)
    decode(token)
  end

  def self.decode(token)
    # Raises a JWT::DecodeError if the token is invalid
    decoded = JWT.decode(token, SECRET_KEY, 'HS256')[0]
    raise JWT::ExpiredSignature, 'Invalidated token' unless _valid?(token_string(decoded))

    HashWithIndifferentAccess.new decoded
  end

  def self._valid?(token)
    RedisClient.instance.client.exists("#{EXPIRED_TOKEN_PREFIX}#{token}").zero?
  end

  def self.invalidate(_token, payload, expire_time = 12.hours.from_now)
    RedisClient.instance.client.set("#{EXPIRED_TOKEN_PREFIX}#{token_string(payload)}", 1,
                                    exat: expire_time.to_i)
    RedisClient.instance.client.del(token_string(payload))
  end

  def self.invalidate_tokens(username)
    redis = RedisClient.instance.client
    tokens = redis.keys("#{ACTIVE_TOKEN_PREFIX}#{username}*")
    Rails.logger.info "Invalidating #{tokens.count} tokens for user: '#{username}'"
    tokens.each do |token|
      continue unless token.starts_with?("#{ACTIVE_TOKEN_PREFIX}#{username}")
      token_data = redis.get(token)
      begin
        payload = decode(token_data)
      rescue JWT::ExpiredSignature => e
        next
      end

      invalidate(token, payload)
    end
  end
end
