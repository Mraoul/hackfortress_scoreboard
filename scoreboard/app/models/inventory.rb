class Inventory < ApplicationRecord
  belongs_to :participant
  belongs_to :item
  validates_presence_of :participant_id
  validates_presence_of :item_id
  attr_readonly :participant_id
  attr_readonly :item_id
  after_create :initialize_count

  # def self.create_all
  #   Item.all.each do |item|
  #     Participant.all.each do |participant|
  #       Inventory.find_or_create_by(:participant_id => participant, :item_id => item.id)
  #     end
  #   end
  # end

  def self.byRound(round_id)
    round = Round.includes(:participants).find(round_id)
    participant_ids = round.participants.map { |participant| participant.id }.compact
    inventories = Inventory.includes(:item, :participant => [:round]).where(participant_id: participant_ids)
    rounds = self.organizeInventories(inventories)
    return rounds
  end

  def self.organizeInventories(inventories)
    rounds = Hash.new
    inventories.each do |inventory|
      participant = inventory.participant
      round = inventory.participant.round
      if !rounds.has_key?(round.name)
        rounds[round.name] = Hash.new
      end
      if !rounds[round.name].has_key?(inventory.item.name)
        rounds[round.name][inventory.item.name] = Hash.new
      end
      rounds[round.name][inventory.item.name][participant.color.to_s] = inventory
    end
    return rounds
  end

  private

  def initialize_count
    self.quantity = self.item.starting_quantity
    self.save
  end
end
