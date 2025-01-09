# frozen_string_literal: true

# Puzzles Controller
class Api::PuzzlesController < Api::ApplicationController
  before_action :authenticate

  def round_puzzles
    color = params.require(:color)

    active_round = Game.with_live.instance.live

    if active_round.nil?
      render json: {}
      return
    end

    participant = active_round.get_participant_with_color(color)

    if participant.nil?
      render json: { 'error': 'unable to find participant with provided color' }, status: :bad_request
      return
    end

    if !judge? && @current_team.id != participant.team.id
      render json: { 'error': 'team is not participating in this round or wrong team used' }, status: :forbidden
      return
    end

    # status = participant.get_statuses

    players_array = []
    participant.team&.players&.each do |player|
      players_array.push([player.name, player.id])
    end

    solved = {}

    Submission.includes(:player).where('participant_id = ? ', participant.id).each do |sub|
      solved[sub.puzzle_id] = sub.player.name
    end

    categories = collect_puzzles(active_round)

    json_response = {
      'round': {
        'id': active_round.id,
        'name': active_round.name
      },
      'participant': {
        'id': participant.id,
        'score': {
          'hack': participant.hack_score,
          'bonus': participant.bonus_score,
          'tf2': participant.tf2_score
        },
        'hints': participant.hints,
        'color': participant.color
      },
      'categories': categories,
      'solved': solved,
      'players': players_array,
      'gameTime': Automation.instance.get_gametime
    }
    render json: json_response
  end

  def download_file
    begin
      puzzle_id = params.require(:id)
    rescue ActionController::ParameterMissing
      render json: { 'error': 'missing required id field' }, status: :bad_request
      return
    end

    begin
      puzzle = Puzzle.find(puzzle_id.to_i)
    rescue ActiveRecord::RecordNotFound
      render json: { 'error': 'Puzzle does not exist' }, status: :not_found
      return
    end

    unless puzzle
      render json: { 'error': 'Puzzle does not exist' }, status: :not_found
      return
    end

    if puzzle.data_source == 'text_only'
      render json: { 'error': 'Puzzle does not have downloadable component' }, status: :bad_request
      return
    end

    active_round = Game.with_live.instance.live

    unless judge?
      if active_round.nil?
        render json: { 'error': 'No round active' }, status: :forbidden
        return
      end

      participant = active_round.get_participant_with_team_id(@current_team.id)

      if participant.nil?
        render json: { 'error': 'unable to find participant' }, status: :forbidden
        return
      end

      if Automation.instance.is_automated? && (puzzle.unlock > Automation.instance.get_gametime)
        render json: { 'error': 'Puzzle is currently locked' }, status: :forbidden
        return
      end
    end

    case puzzle.data_source
    when 'gcloud'
      url = GoogleDownloader.generate_url(puzzle.data)
      if url.nil?
        render json: { 'error': 'Unable to locate or validate file resource' }, status: :service_unavailable
        nil
      else
        response.headers['Content-Disposition'] = 'attachment'
        redirect_to url, status: :temporary_redirect
      end
    when 'local'
      filepath = LocalFileDownloader.get_filepath(puzzle.data)
      if filepath.nil?
        render json: { 'error': 'Unable to locate or validate file resource' }, status: :service_unavailable
        nil
      else
        begin
          send_file filepath
        rescue ActionController::MissingFile
          render json: { 'error': 'file not found, contact judge' }, status: :service_unavailable
          nil
        end
      end
    else
      render json: { 'error': 'unexpected data source for puzzle' }, status: :service_unavailable
      nil
    end
  end

  def submit_solution
    json_response = {}
    status_code = 200

    permitted_attributes = %i[team player puzzle soln]
    required_attributes = %i[team player puzzle]
    permitted_attributes.append(:judge_submit) if judge?

    permitted = params.permit(permitted_attributes).with_defaults!({ soln: '' })
    (team_id, player_id, puzzle_id) = permitted.require(required_attributes)
    player_soln = permitted[:soln]
    judge_submit = permitted.key?(:judge_submit) ? permitted[:judge_submit] : false

    round = Game.with_live.instance.live

    if round.nil?
      render json: { 'error': 'No active round' }, status: :bad_request
      return
    end

    begin
      participant = round.participants.where('id = ?', team_id).first
      raise Exceptions::InvalidTeamError unless participant

      player = Player.where(
        'id = ? AND team_id = ?',
        player_id, participant.team.id || nil
      ).first # ensure correct team too
      raise Exceptions::InvalidPlayerError unless player

      puzzle = Puzzle.find(puzzle_id)
      raise Exceptions::InvalidPuzzleError unless puzzle
      raise Exceptions::PermissionError if judge_submit && !judge?
      if !judge? && (participant.nil? || participant.team.nil? || (participant.team.id != @current_team.id))
        # submitting for the wrong team?
        raise Exceptions::TeamMismatchError
      end
      raise Exceptions::EmptySolutionError if player_soln.blank? && (contestant? || (judge? && !judge_submit))
      raise Exceptions::StringLengthError unless player_soln.length <= 255

      _submission, delay = CtfServices::PuzzleSubmitter.call(
        participant, player, puzzle,
        round, player_soln, judge_submit
      )

      response_status = 'You Got It! '

      if delay.positive?
        response_status += " But a submission delay of #{delay} seconds!"
        json_response['modifier'] = 'submission delay'
      end

      json_response['message'] = response_status
    rescue Exceptions::PermissionError
      json_response['error'] = 'Permission Denied'
      status_code = :forbidden
    rescue Exceptions::TeamMismatchError
      json_response['error'] = 'Submitting for other team not allowed'
      status_code = :forbidden
    rescue Exceptions::InvalidTeamError
      json_response['error'] = 'Invalid Team'
      status_code = :forbidden
    rescue Exceptions::InvalidPlayerError
      json_response['error'] = 'Player selected does not exist'
      status_code = :bad_request
    rescue Exceptions::RoundNotActiveError
      json_response['error'] = 'No active round'
      status_code = :bad_request
    rescue Exceptions::EmptySolutionError
      json_response = {
        'reason': 'solutionempty',
        'message': 'Solutions must not be empty'
      }
      status_code = :bad_request
    rescue Exceptions::CapBlockError => e
      json_response = {
        'reason': 'capblocked',
        'more': e.time_remaining,
        'message': "CAP Blocked! #{e.time_remaining}s Left ..."
      }
      status_code = :bad_request
    rescue Exceptions::PuzzleSolvedError
      json_response = {
        'reason': 'solved',
        'message': 'Puzzle aready solved'
      }
      status_code = :bad_request
    rescue Exceptions::PuzzleSolvedOtherTeamError
      json_response = {
        'reason': 'solved_other',
        'message': 'Puzzle already solved by other team :)'
      }
      status_code = :bad_request
    rescue Exceptions::IncorrectSolutionError
      json_response = {
        'reason': 'incorrect',
        'message': 'Nope! Try again!'
      }
      status_code = :bad_request
    rescue Exceptions::StringLengthError
      json_response = {
        'reason': 'length',
        'message': 'Provided solution is too long (> 255 characters)'
      }
      status_code = :bad_request
    rescue StandardError => e
      logger.error(e.message)
      logger.error(e.backtrace.join('\n'))
      json_response['error'] = 'Internal error saving submission'
      status_code = 500
    end

    render json: json_response, status: status_code
  end

  private

  def collect_puzzles(round)
    categories = {}
    round.puzzleset.puzzles.order(name: :asc).each do |puzzle|
      unless categories.key?(puzzle.category.name)
        categories[puzzle.category.name] = {
          'id': puzzle.category.id,
          'puzzles': []
        }
      end

      locked = false
      locked = true if Automation.instance.is_automated? && (puzzle.unlock > Automation.instance.get_gametime)

      puzzle_data = {
        'id': puzzle.id,
        'status': locked ? 'locked' : 'unlocked'
      }

      if !locked || judge?
        puzzle_data.merge!({
                             'name': puzzle.name,
                             'data': puzzle.data,
                             'data_source': puzzle.data_source,
                             'points': puzzle.points,
                             'description': puzzle.description,
                             'unlock': puzzle.unlock,
                             'author': puzzle.author
                           })
      end

      if judge?
        puzzle_data.merge!({
                             'solution': puzzle.solution,
                             'hints': puzzle.hints
                           })
      end

      categories[puzzle.category.name][:puzzles].push(puzzle_data)
    end
    categories
  end
end
