# frozen_string_literal: true

require 'test_helper'

class PuzzleTest < ActiveSupport::TestCase
  setup do
    @category = categories(:category43)
    @puzzle = @category.puzzles.build(puzzles(:puzzle350).attributes.except('created_at', 'updated_at'))
  end

  test 'puzzle can get category' do
    assert @puzzle.category == @category
  end

  test 'get puzzles not in set' do
    no_set_puzzles = Puzzle.no_set
    assert_not no_set_puzzles.empty?
  end
end
