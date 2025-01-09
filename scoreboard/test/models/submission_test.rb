# frozen_string_literal: true

require 'test_helper'

class SubmissionTest < ActiveSupport::TestCase
  setup do
  end

  test 'create submission' do
    submission = Submission.new(
      participant: Participant.find(participants(:participant1).id),
      puzzle: Puzzle.find(puzzles(:puzzle350).id),
      value: 10,
      player: Player.find(players(:player1).id)
    )
    assert submission
  end

  test 'get all solved hash' do
    solved = Submission.getsolved
    assert_includes solved, submissions(:submission1).puzzle.id
  end
end
