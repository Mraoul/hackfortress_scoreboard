# frozen_string_literal: true

class Participant < ApplicationRecord
  belongs_to :round
  belongs_to :team
  has_many :submissions, dependent: :destroy
  has_many :statuses, dependent: :destroy
  has_many :purchases
  has_many :inventories

  enum color: { red: 0, blue: 1 }

  validates :color, presence: true
  after_create :create_inventories
  after_update :send_wallet, if: -> { saved_change_to_tf2coins? || saved_change_to_hackcoins? }

  # Provides the 'team number' for communication
  # with TF2
  def team_number
    if color == 'red'
      1
    elsif color == 'blue'
      2
    end
  end

  def inventory_of(item, eager = false)
    if eager
      inventories.each do |inventory|
        return inventory if inventory.item_id == item.id
      end
    else
      inventories.where(item_id: item.id).first
    end
  end

  def store_down?
    if Time.now.to_i > store_status
      self.store_status = 0
      save!
    end

    return true if store_status.positive?

    false
  end

  def store_return_seconds
    time_diff = store_status - Time.now.to_i
    return 0 unless time_diff.positive?

    time_diff
  end

  def parse_statuses
    return {} if statuses.empty?

    status = {}
    statuses.each do |stat|
      Rails.logger.info 'Processing Statuses'
      if Status::Status_valuesR[stat.status_type] == 'CAP_DELAY'
        status['CAP_DELAY'] = 30
      elsif Status::Status_valuesR[stat.status_type] == 'CAP_BLOCK'
        time_remain = stat.duration - (Time.now.to_i - stat.created_at.to_i) # second precision :(
        if time_remain.positive?
          status['CAP_BLOCK'] = time_remain
        else # it's expired, get rid of it
          stat.destroy
        end
      end
    end
    status
  end

  private

  def create_inventories
    Item.all.each do |item|
      Inventory.find_or_create_by(participant_id: id, item_id: item.id)
    end
  end

  def send_wallet
    logger.debug('Sending Wallet Update')
    RedisPublisher.publish_to(
      "/#{color}/wallet/updates",
      RedisPublisher::WalletMessage.new(
        tf2coins,
        hackcoins
      ).to_hash
    )
  end
end
