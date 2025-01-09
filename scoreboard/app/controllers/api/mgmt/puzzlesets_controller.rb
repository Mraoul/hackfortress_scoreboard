class Api::Mgmt::PuzzlesetsController < Api::ApplicationController
  before_action :authenticate_admin_only, except: %i[index show]
  before_action :authenticate_judge, only: %i[index show]

  def index
    response = []
    Puzzleset.all.each do |puzzleset|
      response.push(
        puzzleset.as_json(
          except: %i[created_at updated_at]
        )
      )
    end

    response.push(
      {
        "id": 0,
        "name": 'No Set'
      }.as_json
    )

    render json: response
  end

  def show
    categories = {}
    if params[:id].to_i < 1
      puzzles = Puzzle.no_set
    else
      puzzleset = Puzzleset.includes(puzzles: [:category]).find(params[:id])
      puzzles = puzzleset.puzzles.order(name: :asc)
    end

    puzzles.each do |puzzle|
      unless categories.has_key?(puzzle.category.name)
        categories[puzzle.category.name] = {
          'id': puzzle.category.id,
          'name': puzzle.category.name,
          'puzzles': []
        }
      end
      categories[puzzle.category.name][:puzzles].push(puzzle.as_json(except: %i[created_at updated_at]))
    end

    render json: categories.values
  end

  def create
    puzzleset_name = params.require(:puzzleset).require(:name)
    puzzleset = Puzzleset.new(name: puzzleset_name)

    if puzzleset.save
      render json: {}
    else
      render json: { "error": puzzleset.errors }, status: :internal_server_error
    end
  end

  def update
    puzzleset = Puzzleset.find(params.require(:id))
    puzzleset_name = params.require(:puzzleset).require(:name)

    if puzzleset.update(name: puzzleset_name)
      render json: puzzleset
    else
      render json: { "error": puzzleset.errors }, status: :internal_server_error
    end
  end

  def destroy
    puzzleset = Puzzleset.find(params.require(:id))
    puzzleset.destroy

    render json: {}
  end
end
