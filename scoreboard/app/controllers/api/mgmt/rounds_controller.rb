class Api::Mgmt::RoundsController < Api::ApplicationController
  before_action :authenticate_admin_only, except: %i[round_console puzzleviewer]
  before_action :authenticate_judge, only: %i[round_console puzzleviewer]

  # GET /rounds
  def index
    response = {
      'game': {},
      'rounds': [],
      'teams': [],
      'puzzlesets': [],
      'automation': Automation.instance.as_json(except: [:locked_puzzles])
    }

    game = Game.instance
    response[:game] = {
      ready_round: game.ready_round_id,
      live_round: game.live_round_id,
      automated: game.automated
    }

    Team.all.each do |team|
      response[:teams].push(
        team.as_json(
          only: %i[id name]
        )
      )
    end

    Puzzleset.all.each do |puzzleset|
      response[:puzzlesets].push(
        puzzleset.as_json(
          only: %i[id name]
        )
      )
    end

    rounds = Round.includes(:puzzleset, participants: [:team])
    rounds.each do |round|
      response[:rounds].push(
        round.as_json(
          except: %i[created_at updated_at],
          include: {
            participants: {
              only: %i[id team_id]
            }
          }
        )
      )
    end

    render json: response
  end

  # POST /rounds
  def create
    round = Round.new
    permitted = params.permit(:team1, :team2, round: %i[name puzzleset])
    begin
      permitted.require(:round).tap do |round_params|
        name = round_params.require(:name)
        round.name = name

        round.puzzleset = Puzzleset.where(id: round_params[:puzzleset]).first if round_params.has_key?(:puzzleset)
      end
    rescue ActionController::ParameterMissing
      render json: { "errors": 'missing required parameter name' }, status: :bad_request
      return
    end

    begin
      round.transaction do
        round.save!
        if permitted.has_key?(:team1) and permitted[:team1].to_i > 0
          round.red_participant.team = Team.where(id: permitted[:team1]).first
          round.red_participant.save!
        end
        if permitted.has_key?(:team2) and permitted[:team2].to_i > 0
          round.blue_participant.team = Team.where(id: permitted[:team2]).first
          round.blue_participant.save!
        end
      end
      render json: { id: round.id }
    rescue StandardError => e
      Rails.logger.error e.message
      Rails.logger.error e.backtrace.join('\n')
      render json: { "errors": round.errors }, status: :unprocessable_entity
    end
  end

  def ready_round
    round_id = params.permit(:id).require(:id)
    round = Round.where(id: round_id).first

    if round.nil?
      render json: { "error": 'provided round_id does not exist' }, status: :bad_request
      return
    end

    game = Game.instance

    game.ready = if game.ready == round
                   nil
                 else
                   round
                 end

    game.save

    render json: {}
  end

  def activate_round
    round_id = params.permit(:id).require(:id)
    round = Round.where(id: round_id).first

    if round.nil?
      render json: { "error": 'provided round_id does not exist' }, status: :bad_request
      return
    end

    game = Game.instance

    game.live = if game.live == round
                  nil
                else
                  round
                end
    game.save

    render json: {}
  end

  # PUT /rounds/1
  def update
    permitted = params.permit(:id, :team1, :team2, round: %i[name puzzleset])

    begin
      (round_id, round_params) = permitted.require(%i[id round])
    rescue ActionController::ParameterMissing
      render json: { "error": 'missing required parameters' }, status: :bad_request
      return
    end

    begin
      round = Round.includes(participants: [:team]).find(round_id)
    rescue ActiveRecord::RecordNotFound
      render json: { 'error': 'unable to find round by that id' }, status: :bad_request
    end

    name = round_params.require(:name)
    round.name = name

    round.puzzleset = Puzzleset.find(round_params[:puzzleset]) if round_params.has_key?(:puzzleset)

    begin
      round.transaction do
        if permitted.has_key?(:team1)
          round.red_participant.team = Team.find(permitted[:team1])
          round.red_participant.save!
        end

        if permitted.has_key?(:team2)
          round.blue_participant.team = Team.find(permitted[:team2])
          round.blue_participant.save!
        end

        round.save!
      end
      render json: {}
    rescue StandardError => e
      Rails.logger.error e.message
      Rails.logger.error e.backtrace.join('\n')

      render json: { "error": round.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /rounds/1
  def destroy
    round = Round.find(params.require(:id))
    round.destroy

    render json: {}
  end

  def puzzleviewer
    response = {
      solved: Submission.getsolved,
      puzzles: []
    }

    puzzleset_id = params.require(:puzzleset_id)
    puzzleset = Puzzleset.includes(puzzles: :category).find(params[:puzzleset_id].to_i)
    unless puzzleset.nil?
      categories = {}

      puzzleset.puzzles.order(name: :asc).each do |puzzle|
        puzzle_data = puzzle.as_json(
          only: %i[id name description hints data solution points unlock author],
          include: {
            category: {
              only: %i[id name]
            }
          }
        )
        category_name = puzzle_data['category']['name']
        unless categories.key?(category_name)
          categories[category_name] = { id: puzzle_data['category']['id'], puzzles: [] }
        end
        puzzle_data.delete('category')
        categories.dig(category_name, :puzzles).push(puzzle_data)
      end

      categories.each do |category, value|
        response[:puzzles].push({ id: value[:id], name: category, puzzles: value[:puzzles] })
      end
    end

    render json: response
  end

  def automation
    automated = params.require(:automated)
    if [true, false].include?(automated)
      Automation.instance.automated = automated
      render json: {}
    else
      render json: { "error": 'expected a boolean value' }, status: :bad_request
    end
  end

  def force_game_start
    MgmtServices::GameServices::GameStarter.call

    render json: {}
  end

  def force_game_end
    MgmtServices::GameServices::GameEnder.call

    render json: {}
  end

  def force_unlock
    gametime = params.require(:gametime)
    gametime = gametime.to_i || 50
    lplist = Automation.instance.locked_puzzles
    Round.unlock_puzzles(gametime, lplist) if lplist.length > 0

    render json: {}
  end

  def round_console
    round = Game.with_live.instance.live

    Rails.logger.info(round)
    if round.nil?
      render json: {}
    else
      response = {
        round: round.as_json(
          only: [:name]
        )
      }
      participants = []
      round.participants.each do |participant|
        part_data = {}
        part_data['participant'] = participant.as_json(
          except: %i[created_at updated_at round_id],
          include: {
            team: {
              only: [:name]
            }
          }
        )

        players = []
        participant.team&.players&.each do |player|
          players.push([player.name, player.id])
        end

        part_data['players'] = players

        solved = []
        Submission.where('participant_id = ? ', participant.id).each do |sub|
          solved.push(sub.puzzle_id)
        end
        part_data['solved'] = solved

        participants.push(part_data)
      end

      response[:participants] = participants

      categories = {}
      round.puzzleset.puzzles.order(name: :asc).each do |puzzle|
        categories[puzzle.category.name] = [] unless categories.has_key?(puzzle.category.name)
        categories[puzzle.category.name].push(puzzle.as_json(
                                                only: %i[id name unlock]
                                              ))
      end

      response[:puzzles] = categories

      response[:gametime] = Automation.instance.get_gametime if Automation.instance.is_automated?

      render json: response
    end
  end
end
