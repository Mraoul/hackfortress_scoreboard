class Api::Mgmt::PuzzlesController < Api::ApplicationController
  before_action :authenticate_judge

  def create
    if params.has_key?(:id)
      puzzle = clonePuzzle(params[:id])
    else
      category = Category.find(params.require(:category_id))
      puzzle = category.puzzles.build(params.require(:puzzle).permit!)
    end

    if !puzzle.nil? && puzzle.save
      render json: puzzle
    else
      render json: { "error": puzzle.errors ? !puzzle.nil? : 'Unable to create puzzle' }
    end
  end

  def update
    puzzle = Puzzle.find(params.require(:id))
    category = puzzle.category
    params[:puzzle][:puzzleset_ids] ||= [] # if not set, set it to an empty array

    if puzzle.update(params[:puzzle].permit!)
      render json: puzzle.as_json(
        except: %i[created_at updated_at],
        include: {
          puzzlesets: {
            only: [:id]
          }
        }
      )
    else
      render json: { "error": puzzle.errors }, status: :internal_server_error
    end
  end

  def destroy
    Puzzle.find(params.require(:id)).destroy
    render json: {}
  end

  def stats
    solved = Puzzle.includes(:submissions).where.not(submissions: { id: nil }).select(:name).as_json(only: [:name])
    unsolved = Puzzle.includes(:submissions).where(submissions: { id: nil }).select(:name).as_json(only: [:name])
    unattempted = Puzzle.includes(:submission_attempts).where(submission_attempts: { id: nil }).select(:name).as_json(only: [:name])
    solvedByCategory = Category.connection.select_all("
        Select categories.name, COUNT(categories.name) AS count FROM puzzles
            INNER JOIN categories ON puzzles.category_id = categories.id
            WHERE puzzles.id IN
                (SELECT DISTINCT puzzle_id FROM submissions)
                GROUP BY categories.name
    ").as_json
    unsolvedByCategory = Category.connection.select_all("
        SELECT categories.name, COUNT(categories.name) AS count FROM puzzles
            INNER JOIN categories ON puzzles.category_id = categories.id
            WHERE puzzles.id NOT IN
                (SELECT DISTINCT puzzle_id FROM submissions)
                GROUP BY categories.name
    ").as_json
    unattemptedByCategory = Category.connection.select_all("
        SELECT categories.name, COUNT(categories.name) AS count FROM puzzles
            INNER JOIN categories ON puzzles.category_id = categories.id
            WHERE puzzles.id NOT IN
                (SELECT DISTINCT puzzle_id FROM submission_attempts)
                GROUP BY categories.name
    ").as_json

    numTimesSolved = Puzzle.connection.select_all("
        SELECT puzzles.name, COUNT(submissions.puzzle_id) AS count, puzzlesets.name AS puzzleset FROM submissions
            INNER JOIN puzzles ON submissions.puzzle_id = puzzles.id
            INNER JOIN puzzles_puzzlesets ON puzzles_puzzlesets.puzzle_id = puzzles.id
            INNER JOIN puzzlesets ON puzzlesets.id = puzzles_puzzlesets.puzzleset_id
            GROUP BY puzzlesets.name, submissions.puzzle_id
    ").as_json

    attemptsByPuzzle = Puzzle.connection.select_all("
        SELECT puzzles.name, COUNT(puzzles.name) AS count FROM puzzles,
            submission_attempts WHERE puzzles.id = submission_attempts.puzzle_id
                GROUP BY puzzles.id
    ").as_json

    solvedByTeam = Puzzle.connection.select_all("
        SELECT
            (SELECT name FROM puzzles WHERE puzzles.id = puzzle_id) AS 'puzzle',
            (SELECT name FROM teams WHERE id =
                (SELECT team_id FROM participants
                    WHERE id = participant_id))
                AS 'team' FROM submissions
                ORDER BY puzzle_id asc, participant_id asc
    ").as_json

    attemptsByTeam = Puzzle.connection.select_all("
        SELECT
            (SELECT name FROM puzzles WHERE puzzles.id = puzzle_id) AS 'puzzle',
            (SELECT name FROM teams WHERE id =
                (SELECT team_id FROM participants
                    WHERE id = participant_id))
                AS 'team',
            COUNT(participant_id) AS 'attempts' FROM submission_attempts
            GROUP BY puzzle_id,participant_id order by puzzle_id asc, participant_id asc
    ").as_json

    render json: {
      'solved': solved,
      'unsolved': unsolved,
      'unattempted': unattempted,
      'solvedByCategory': solvedByCategory,
      'unsolvedByCategory': unsolvedByCategory,
      'unattemptedByCategory': unattemptedByCategory,
      'numTimeSolved': numTimesSolved,
      'attemptsByPuzzle': attemptsByPuzzle,
      'solvedByTeam': solvedByTeam,
      'attemptsByTeam': attemptsByTeam
    }
  end

  private def clonePuzzle(puzzle_id)
    begin
      master = Puzzle.find(puzzle_id)
    rescue StandardError
      return nil
    end

    return nil if master.nil?

    category = master.category
    puzzle = master.dup
    puzzle.name = 'Clone of ' + puzzle.name
    puzzle
  end
end
