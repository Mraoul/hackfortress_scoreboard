# frozen_string_literal: true

# Hackonomy Controller
class Api::HackonomyController < Api::ApplicationController
  def storefront
    json_response = {}
    status_code = 200

    begin
      color = params.require(:color)
    rescue ActionController::ParameterMissing
      render json: { 'error': 'missing required color field' }, status: :bad_request
      return
    end

    active_round = Game.with_live.instance.live
    participant = nil

    if !active_round.nil? && %w[red blue].include?(color)
      if judge?
        participant = active_round.get_participant_with_color(color)
      else
        participant = active_round.get_participant_with_team_id(@current_team.id)
        if participant.nil? || participant.color != color
          render json: { 'error': 'unable to find team or match team with provided color' }, status: :bad_request
          return
        end
      end
    end

    if participant.nil?  # viewing only
      json_response['store'] = {
        'status': 'up',
        'sale_ratio': 100
      }
      json_response['wallet'] = {
        'tf2': 0,
        'hack': 0
      }

      json_response['participant'] = { 'id': nil }
      json_response['color'] = color
    else
      store_status = 'up'
      store_status = 'down' if participant.store_down?

      json_response['store'] = {
        'status': store_status,
        'sale_ratio': active_round.store_sale_ratio
      }
      json_response['wallet'] = {
        'tf2': participant.tf2coins,
        'hack': participant.hackcoins
      }

      json_response['participant'] = { 'id': participant.id }
      json_response['color'] = participant.color
    end

    hack_items = build_hack_catalog(participant)
    tf2_items = build_tf2_catalog(participant)

    json_response['items'] = {
      'hack': hack_items,
      'tf2': tf2_items
    }

    render json: json_response, status: status_code
  end

  def purchase_item
    json_response = {}
    status_code = 200

    begin
      (participant_id, item_id) = params.require(%i[team item])
    rescue ActionController::ParameterMissing
      render json: { 'error': 'required parameters missing' }, status: :bad_request
      return
    end

    begin
      participant_id = participant_id.to_i
      item_id = item_id.to_i
    rescue StandardError
      render json: { 'error': 'invalid input' }, status: :bad_request
      return
    end

    item = Item.includes(:item_group).where(id: item_id).first

    if item.nil?
      render json: { 'error': 'invalid item id' }, status: :bad_request
      return
    end

    round = Game.with_live.instance.live

    begin
      raise Exceptions::RoundNotActiveError if round.nil?

      if participant_id == round.red_participant.id
        participant = round.red_participant
      elsif participant_id == round.blue_participant.id
        participant = round.blue_participant
      else
        raise Exceptions::InvalidTeamError
      end

      raise Exceptions::TeamMismatchError if !judge? && (@current_team.id != participant.team.id)

      friendly_text, remaining_stock = HackonomyServices::HackonomyPurchaser.call(
        round, participant, item
      )

      json_response = { 'perk': friendly_text }
      json_response['stock'] = remaining_stock
    rescue Exceptions::InvalidTeamError
      json_response = { 'error': 'Invalid Team' }
      status_code = 400
    rescue Exceptions::RoundNotActiveError
      json_response = { 'error': 'No round is active' }
      status_code = 400
    rescue Exceptions::TeamMismatchError
      json_response = { 'error': 'Purchasing for wrong team' }
      status_code = 400
    rescue Exceptions::InvalidItemError
      json_response = { 'error': 'Invalid Item' }
      status_code = 400
    rescue Exceptions::StoreDownError
      json_response = {
        'reason': 'store_down',
        'message': 'Store is Down'
      }
      status_code = 400
    rescue Exceptions::NoStockError
      json_response = {
        'reason': 'no_stock',
        'message': 'Item requested is out of stock!'
      }
      status_code = 400
    rescue Exceptions::InsufficientFundsError
      json_response = {
        'reason': 'low_funds',
        'message': 'Requested item costs more than available funds'
      }
      status_code = 400
    rescue StandardError => e
      logger.error(e.message)
      logger.error(e.backtrace.join('\n'))
      json_response = { 'error': 'Internal error' }
      status_code = 500
    end

    render json: json_response, status: status_code
  end

  private

  def build_hack_catalog(participant)
    hack_items = []
    ItemGroup.hack.each do |hack_item_group|
      hack_group_items = []
      hack_item_group.items.each do |hack_item|
        hack_item_meta = {
          'id': hack_item.id,
          'name': hack_item.name,
          'description': hack_item.description,
          'cost': hack_item.cost
        }
        unless participant.nil?
          inventory = participant.inventory_of(hack_item, true)
          hack_item_meta['inventory'] = inventory.quantity unless inventory.nil?
        end
        hack_group_items.append(hack_item_meta)
      end

      hack_items.push({
                        'id': hack_item_group.id,
                        'name': hack_item_group.name,
                        'description': hack_item_group.description,
                        'picture_location': view_context.image_path(hack_item_group.picture_location),
                        'discountable': hack_item_group.discountable,
                        'items': hack_group_items
                      })
    end

    hack_items
  end

  def build_tf2_catalog(participant)
    tf2_items = []
    ItemGroup.tf2.each do |tf2_item_group|
      tf2_group_items = []
      tf2_item_group.items.each do |tf2_item|
        tf2_item_meta = {
          'id': tf2_item.id,
          'name': tf2_item.name,
          'description': tf2_item.description,
          'cost': tf2_item.cost
        }
        unless participant.nil?
          inventory = participant.inventory_of(tf2_item, true)
          tf2_item_meta['inventory'] = inventory.quantity unless inventory.nil?
        end
        tf2_group_items.append(tf2_item_meta)
      end

      tf2_items.push({
                       'id': tf2_item_group.id,
                       'name': tf2_item_group.name,
                       'description': tf2_item_group.description,
                       'picture_location': view_context.image_path(tf2_item_group.picture_location),
                       'discountable': tf2_item_group.discountable,
                       'items': tf2_group_items
                     })
    end

    tf2_items
  end
end
