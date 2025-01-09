class Round < ApplicationRecord
  has_many :participants, :dependent => :destroy
  belongs_to :puzzleset
  has_many :teams, :through => :participants
  has_many :submissions, :through => :participants
  has_many :events, :through => :participants
  has_many :statuses, :through => :participants

  after_create :create_participants

  validates_presence_of :name
  validates_uniqueness_of :name

  def get_participant_with_team_id(team_id)
    participants.each do |participant|
      if participant.team.id == team_id
        return participant
      end
    end
    return nil
  end

  def red_participant
    participants.each do |participant|
      if participant.red?
        return participant
      end
    end
    nil
  end

  def blue_participant
    participants.reverse_each do |participant|
      if participant.blue?
        return participant
      end
    end
    nil
  end

  def get_participant_with_color(color)
    if color == "red"
      return red_participant
    elsif color == "blue"
      return blue_participant
    else
      return nil
    end
  end

  def other_participant(participant)
    return nil unless participants.include?(participant)

    participants.each { |p| return p if participant != p }
  end

  private

  def create_participants
    Participant.create!(:round_id => self.id, :team_id => nil, :color => :red)
    Participant.create!(:round_id => self.id, :team_id => nil, :color => :blue)
  end
end
