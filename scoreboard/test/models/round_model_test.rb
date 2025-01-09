# frozen_string_literal: true

require 'test_helper'

class RoundTest < ActiveSupport::TestCase
  setup do
    @round = rounds(:round1)
  end

  test 'has participants' do
    assert @round.participants.count == 2
    assert @round.red_participant
    assert @round.blue_participant
  end

  test 'get opposite participant' do
    assert @round.other_participant(@round.red_participant) == @round.blue_participant
  end

  test 'participants created' do
    round = Round.new(name: 'TestRound')
    assert round.save
    assert round.participants.count == 2
  end

  test 'requires name' do
    round = Round.new
    assert_not round.valid?
    assert_not round.save
  end

  test 'unique name' do
    round = Round.new(name: 'QuarterFinal1')
    assert_not round.save
  end

  test 'get red team' do
    assert @round.get_participant_with_color('red')
  end

  test 'get blue team' do
    assert @round.get_participant_with_color('blue')
  end
end
