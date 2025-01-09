# frozen_string_literal: true

require 'test_helper'

class RedisPublisherTest < ActionDispatch::IntegrationTest
  setup do
  end

  teardown do
  end

  test 'publish to a channel' do
    RedisPublisher.publish_to('test', 'test')
  end
end
