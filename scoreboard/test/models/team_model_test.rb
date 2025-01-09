# frozen_string_literal: true

require 'test_helper'

class TeamTest < ActiveSupport::TestCase
  test 'create team also creates players' do
    team = Team.new(name: 'testteam')
    assert team.save
    assert team.players.count == 5
  end

  test 'create team also creates user' do
    team = Team.new(name: 'testteam')
    assert team.save
    assert team.user.id
  end

  test 'requires team name' do
    team = Team.new
    assert_not team.valid?
    assert_not team.save
  end

  test 'unique team name' do
    team = Team.new(name: 'Team 1')
    assert_not team.valid?
    assert_not team.save
  end
end
