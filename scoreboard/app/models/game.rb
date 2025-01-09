# frozen_string_literal: true

class Game < ApplicationRecord
  belongs_to :live, class_name: :Round, foreign_key: 'live_round_id'
  belongs_to :ready, class_name: :Round, foreign_key: 'ready_round_id'
  has_many :participants, through: :live
  has_one :puzzleset, through: :live
  has_many :puzzles, through: :puzzleset
  validates :singleton_guard, inclusion: { in: [0] }
  validates :singleton_guard, uniqueness: true

  scope :with_live, -> { includes(live: [participants: [team: [:players]], puzzleset: [puzzles: [:category]]]) }
  scope :with_ready, -> { includes(ready: [participants: [team: [:players]], puzzleset: [puzzles: [:category]]]) }

  def self.instance
    first
  end

  def start
    if !ready.nil?
      self.live = ready
      save!
    else
      Rails.logger.warn "Game.start called when no round set to 'ready' state"
    end
  end

  def stop
    if !live.nil?
      self.live = nil
      save!
    else
      Rails.logger.warn "Game.stop called when no round set to 'live' state"
    end
  end
end
