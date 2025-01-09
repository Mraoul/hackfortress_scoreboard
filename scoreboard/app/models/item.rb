class Item < ApplicationRecord
  belongs_to :item_group
  has_many :inventories

  validates_presence_of :name

  after_create :create_inventories

  def self.reset_stock
    items = Item.includes(:inventories).all
    Item.transaction do
      items.each do |item|
        item.inventories.each do |inventory|
          inventory.quantity = item.starting_quantity
          inventory.save
        end
      end
    end
  end

  private

  def create_inventories
    Participant.all.each do |participant|
      inventory = Inventory.find_or_create_by(participant_id: participant.id, item_id: self.id)
    end
  end
end
