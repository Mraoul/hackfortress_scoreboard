# frozen_string_literal: true

require 'test_helper'

class InventoryTest < ActiveSupport::TestCase
  setup do
    @participant = Participant.find(participants(:participant1).id)
    @participant.send(:create_inventories)
    @participant.inventories.each do |inventory|
      inventory.send(:initialize_count)
    end
  end

  test 'inventories by round' do
    round = Round.find(rounds(:round1).id)
    round_inventory = Inventory.byRound(round.id)
    assert round_inventory
  end
end
