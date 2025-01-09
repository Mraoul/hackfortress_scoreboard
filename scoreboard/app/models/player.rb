class Player < ApplicationRecord
  has_many :player_points
  belongs_to :team

  def points
    points = PlayerPoint.where(:player_id => self.id)
    total = 0
    points.each do |point|
      total += point.points
    end
    return total
  end
end
