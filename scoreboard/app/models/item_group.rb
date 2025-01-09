class ItemGroup < ApplicationRecord
  has_many :items, :dependent => :destroy
  scope :hack, -> { where(:hack_item => true).includes(:items) }
  scope :tf2, -> { where(:hack_item => false).includes(:items) }
end
