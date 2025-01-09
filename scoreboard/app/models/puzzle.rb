class Puzzle < ApplicationRecord
  belongs_to :category
  has_and_belongs_to_many :puzzlesets
  has_many :submissions
  has_many :submission_attempts

  enum data_source: [:text_only, :gcloud, :local]

  def self.no_set
    includes(:category).where(<<-SQL)
            NOT EXISTS (SELECT 1
            FROM puzzles_puzzlesets
            WHERE puzzles.id = puzzles_puzzlesets.puzzle_id)
    SQL
  end

  # serialize :hints, Array
end
