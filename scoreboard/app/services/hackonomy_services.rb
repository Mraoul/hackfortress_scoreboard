# frozen_string_literal: true

module HackonomyServices
  class HackonomyPurchaser < ApplicationService
    def initialize(round, participant, item)
      @round = round
      @participant = participant
      @opp_participant = @round.other_participant(@participant)
      @item = item
      super()
    end

    def call
      raise Exceptions::RoundNotActiveError if @participant.color.nil?
      raise Exceptions::InvalidItemError if @item.nil?
      raise Exceptions::StoreDownError.new('Store Down', @participant.store_return_seconds) if @participant.store_down?

      is_hack_item = @item.item_group.hack_item
      sale_ratio = @round.store_sale_ratio

      if @item.discountable
        item_cost = (@item.cost * (sale_ratio / 100.00)).floor
        item_cost = 1 unless item_cost.positive?
      else
        item_cost = @item.cost
      end

      inventory = @participant.inventory_of(@item)

      Purchase.transaction do
        inventory.lock!
        raise Exceptions::NoStockError if inventory.quantity < 1

        @participant.lock!
        if (is_hack_item && (item_cost > @participant.hackcoins)) || (
            !is_hack_item && (item_cost > @participant.tf2coins))
          raise Exceptions::InsufficientFundsError
        end

        inventory.quantity -= 1
        if is_hack_item
          @participant.hackcoins -= item_cost
        else
          @participant.tf2coins -= item_cost
        end

        begin
          inventory.save!
          @participant.save!
        rescue StandardError => e
          Rails.logger.error("Unable to save transaction #{e.message}")
          Rails.logger.error(e.backtrace.join('\n'))
          raise
        end

        Purchase.create(
          item_id: @item.id, participant_id: @participant.id,
          sale_ratio: @item.discountable ? sale_ratio : 100
        )
      end

      begin
        friendly_text = handle_purchase(
          @item, @participant, @opp_participant, item_cost
        )
      rescue StandardError => e
        Rails.logger.debug("#{e.backtrace.first}: #{e.message} (#{e.class})")
        Rails.logger.debug(e.backtrace.drop(1).map { |s| "\t#{s}" })
        raise
      end

      [friendly_text, inventory.quantity]
    end

    def handle_purchase(item, participant, opp_participant, item_cost)
      num_players = item.players
      modifier = item.modifier
      argument = item.argument
      friendly_text = item.friendly_text
      effect_iden = item.effect_iden
      is_buff = item.is_buff
      cost = item_cost
      is_hack_item = item.item_group.hack_item

      from_team = participant
      to_team = is_buff ? participant : opp_participant

      redis_queue = RedisPublisher::Queue.new

      if is_hack_item
        case effect_iden
        when 'hint_add'
          participant.hints += argument
          participant.save
          redis_queue.queue_update_to(
            participant.color,
            RedisPublisher::HintMessage.new(
              participant.color,
              argument.to_s
            )
          )

        when 'cap_block_add'
          created = GameServices::CapBlockAdder.call(to_team)
          unless created.nil?
            redis_queue.queue_update_to(
              opp_participant.color,
              RedisPublisher::StatusAddMessage.new(
                opp_participant.color,
                'cap_block'
              )
            )
          end
        when 'cap_block_del'
          removed = GameServices::CapBlockRemover.call(participant)
          if removed
            redis_queue.queue_update_to(
              participant.color,
              RedisPublisher::StatusCapBlockRemoveMessage.new(
                participant.color
              )
            )
          end
        when 'effect_delay_add'
          created = GameServices::CapDelayAdder.call(to_team, 100) # opposite team
          unless created.nil?
            redis_queue.queue_update_to(
              to_team.color,
              RedisPublisher::StatusAddMessage.new(
                to_team.color,
                'cap_delay'
              )
            )
          end
        when 'effect_delay_del'
          removed = GameServices::CapDelayRemover.call(to_team)
          if removed
            redis_queue.queue_update_to(
              to_team.color,
              RedisPublisher::StatusCapDelayRemoveMessage.new(
                to_team.color,
                message[:end],
                message[:mytime]
              )
            )
          end
        when 'store_dos'
          now60 = Time.now.to_i + 60 # seconds
          to_team.store_status = now60
          to_team.save
        when 'hack_event'
          Rails.logger.info('Received Generic Hack Event')
        else
          Rails.logger.error("Received unexpected effect_iden #{effect_iden}")
        end

        HFComms.notify_hack_effect(
          HFComms::HackEffectMessage.new(
            friendly_text,
            from_team.team_number,
            to_team.team_number,
            cost
          )
        )
      else # TF2 Purchase
        argument += rand(modifier + 1) if modifier.positive?

        Rails.logger.debug("TF2 Purchase: #{friendly_text} (#{effect_iden}), Arg: #{argument} -- Players: #{num_players}")

        status = participant.parse_statuses
        if status['CAP_DELAY']
          delay = status['CAP_DELAY']
          GameServices::CapDelayRemover.call(participant)
        else
          delay = 0
        end

        HFComms.notify_tf2_effect(
          HFComms::TF2EffectMessage.new(
            from_team.team_number,
            to_team.team_number,
            num_players,
            argument,
            effect_iden,
            delay,
            cost
          )
        )

      end

      redis_queue.send
      friendly_text
    end
  end
end
