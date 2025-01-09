# frozen_string_literal: true

require 'test_helper'

class BaseControllerTest < ActionDispatch::IntegrationTest
  setup do
    admin = users(:user1)
    admin_token = JsonWebToken.generate(admin, 12.hours.from_now)
    @admin_headers = {
      'Authorization' => "Bearer #{admin_token}"
    }
    team1 = users(:user2)
    team1_token = JsonWebToken.generate(team1, 12.hours.from_now)
    @team1_headers = {
      'Authorization' => "Bearer #{team1_token}"
    }

    team3 = users(:user4)
    team3_token = JsonWebToken.generate(team3, 12.hours.from_now)
    @team3_headers = {
      'Authorization' => "Bearer #{team3_token}"
    }

    judge = users(:judge)
    judge_token = JsonWebToken.generate(judge, 12.hours.from_now)
    @judge_headers = {
      'Authorization' => "Bearer #{judge_token}"
    }
  end
end
