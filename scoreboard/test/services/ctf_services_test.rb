# frozen_string_literal: true

require 'test_helper'

class CtfServicesTest < ActionDispatch::IntegrationTest
  test 'contestant submits correct solution' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle, round,
      puzzle.solution, false
    )
    assert submission.value
  end

  test 'just submit ignores incorrect solution' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle, round,
      'not solution', true
    )
    assert submission.value
  end

  test 'contestant submits incorrect solution' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]
    assert_raises(Exceptions::IncorrectSolutionError) do
      CtfServices::PuzzleSubmitter.call(
        participant, player, puzzle, round,
        'not the answer', false
      )
    end
  end

  test 'contestant submits correct solution but cap blocked' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    GameServices::CapBlockAdder.call(participant)
    assert_raises(Exceptions::CapBlockError) do
      CtfServices::PuzzleSubmitter.call(
        participant, player, puzzle, round,
        puzzle.solution, false
      )
    end
  end

  test 'prevent double solve' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle, round,
      puzzle.solution, false
    )
    assert submission.value

    assert_raises(Exceptions::PuzzleSolvedError) do
      CtfServices::PuzzleSubmitter.call(
        participant, player, puzzle, round,
        puzzle.solution, false
      )
    end
  end

  test 'contestant submits correct solution with cap delay' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]

    GameServices::CapDelayAdder.call(participant)
    submission, delay_mod = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle, round,
      puzzle.solution, false
    )
    assert submission
    assert delay_mod.positive?
  end

  test 'contestant submits correct solution with quickdraw' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]
    puzzle.quickdraw = true
    puzzle.save!

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle, round,
      puzzle.solution, false
    )
    assert submission
  end

  test 'contestant submits correct solution with quickdraw but solved by other team' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle = round.puzzleset.puzzles[0]
    puzzle.quickdraw = true
    puzzle.save!

    submission, = CtfServices::PuzzleSubmitter.call(
      round.blue_participant, round.blue_participant.team.players[0], puzzle, round,
      puzzle.solution, false
    )
    assert submission

    assert_raises(Exceptions::PuzzleSolvedOtherTeamError) do
      CtfServices::PuzzleSubmitter.call(
        participant, player, puzzle, round,
        puzzle.solution, false
      )
    end
  end

  test 'contestant dominating' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle1 = round.puzzleset.puzzles[0]
    puzzle2 = round.puzzleset.puzzles[1]

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle1, round,
      puzzle1.solution, false
    )
    assert submission

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle2, round,
      puzzle2.solution, false
    )
    assert submission.fdr == 'd'
  end

  test 'contestant dominating so no bonus' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle1 = round.puzzleset.puzzles[0]
    puzzle2 = round.puzzleset.puzzles[1]
    puzzle3 = round.puzzleset.puzzles[2]

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle1, round,
      puzzle1.solution, false
    )
    assert submission

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle2, round,
      puzzle2.solution, false
    )
    assert submission.fdr == 'd'

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle3, round,
      puzzle3.solution, false
    )
    assert submission.fdr.nil?
  end

  test 'contestant revenge' do
    round = Game.with_live.instance.live
    participant = round.red_participant
    player = participant.team.players[0]
    puzzle1 = round.puzzleset.puzzles[0]
    puzzle2 = round.puzzleset.puzzles[1]

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle1, round,
      puzzle1.solution, false
    )
    assert submission

    submission, = CtfServices::PuzzleSubmitter.call(
      participant, player, puzzle2, round,
      puzzle2.solution, false
    )
    assert submission.fdr == 'd'

    submission, = CtfServices::PuzzleSubmitter.call(
      round.blue_participant, round.blue_participant.team.players[0], puzzle2, round,
      puzzle2.solution, false
    )
    assert submission.fdr == 'r'
  end
end
