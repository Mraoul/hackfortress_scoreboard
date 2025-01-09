# frozen_string_literal: true

require 'test_helper'

class PlayerTest < ActiveSupport::TestCase
  setup do
  end

  test 'create player' do
    team = teams(:team6)
    player = Player.new(name: 'test', team_id: team.id)
    player.save
    assert player
  end

  test 'get player points' do
    player = players(:player1)
    assert_not player.points.zero?
  end
end
