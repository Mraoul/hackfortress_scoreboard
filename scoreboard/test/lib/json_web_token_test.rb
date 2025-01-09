# frozen_string_literal: true

require 'test_helper'
require 'timecop'

class JsonWebTokenIntegrationTest < ActionDispatch::IntegrationTest
  setup do
    RedisClient.instance.client.flushdb
  end

  teardown do
    RedisClient.instance.client.flushdb
  end
  test 'generate a token with correct payload and save to Redis' do
    user = users(:user1) # Assuming you have user fixtures defined
    expire_time = Time.now + 12.hours
    token = JsonWebToken.generate(user, expire_time)

    decoded_token = JsonWebToken.decode(token)

    assert_equal user.id, decoded_token['user_id']
    assert_equal user.username, decoded_token['username']

    redis_value = RedisClient.instance.client.get(JsonWebToken.token_string(decoded_token))
    assert_equal token, redis_value
  end

  test 'invalidated token raises an error' do
    user = users(:user1)
    expire_time = Time.now + 12.hours
    token = JsonWebToken.generate(user, expire_time)

    # Simulate token expiration
    Timecop.freeze(expire_time + 3600) # Advance time by 1 hour

    assert_raises(JWT::ExpiredSignature) do
      JsonWebToken.decode(token)
    end
  end

  test 'invalidate tokens for a user' do
    user = users(:user4)
    expire_time1 = Time.now + 12.hours
    expire_time2 = Time.now + 24.hours
    token1 = JsonWebToken.generate(user, expire_time1)
    token2 = JsonWebToken.generate(user, expire_time2)

    # Generate a new token to make sure it's not invalidated by mistake
    admin = users(:user1)
    token3 = JsonWebToken.generate(admin, expire_time1)

    JsonWebToken.invalidate_tokens(user['username'])

    assert_raises(JWT::ExpiredSignature) do
      JsonWebToken.decode(token1)
    end

    assert_raises(JWT::ExpiredSignature) do
      JsonWebToken.decode(token2)
    end

    assert JsonWebToken.decode(token3)
  end
end
