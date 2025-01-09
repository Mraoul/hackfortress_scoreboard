class SubmissionAttempt < ApplicationRecord
  # attr_accessible :participant_id, :player_id, :puzzle_id, :solution
  belongs_to :participant
  belongs_to :player
  belongs_to :puzzle
end
