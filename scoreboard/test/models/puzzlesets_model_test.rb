# frozen_string_literal: true

require 'test_helper'

class PuzzlesetTest < ActiveSupport::TestCase
  setup do
  end

  test 'create puzzleset' do
    puzzleset = Puzzleset.new(name: 'test')
    assert puzzleset
  end

  test 'get category names' do
    puzzleset = Puzzleset.find(puzzlesets(:puzzleset1).id)
    categories = puzzleset.category_names
    assert categories.include?('Data Exploitation')
  end
end
