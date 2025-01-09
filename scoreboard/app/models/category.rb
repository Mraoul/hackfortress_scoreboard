class Category < ApplicationRecord
  has_many :puzzles, dependent: :destroy
  validates :name, presence: true
  validates :name, uniqueness: true
end
