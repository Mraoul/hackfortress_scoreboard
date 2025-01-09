class Submission < ApplicationRecord
  belongs_to :participant
  belongs_to :puzzle
  belongs_to :player

  def self.getsolved()
    solved = Hash.new()
    Submission.all.each do |sub|
      solved[sub.puzzle_id] = true
    end

    return solved
  end
end
