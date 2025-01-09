class Puzzleset < ApplicationRecord
  has_and_belongs_to_many :puzzles
  has_many :rounds
  has_many :categories, :through => :puzzles

  validates_presence_of :name
  validates_uniqueness_of :name

  def category_names
    categories.distinct.pluck(:name)
  end
end
