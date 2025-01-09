class Api::Mgmt::CategoriesController < Api::ApplicationController
  before_action :authenticate_judge

  def index
    response = { 'categories': [], 'puzzlesets': [] }

    Category.includes(puzzles: [:puzzlesets]).all.each do |category|
      response[:categories].push(
        category.as_json(
          except: %i[created_at updated_at]
        )
      )
    end

    Puzzleset.all.each do |set|
      response[:puzzlesets].push(
        set.as_json(
          except: %i[created_at updated_at]
        )
      )
    end

    render json: response
  end

  def show
    response = { 'category': {}, puzzlesets: [] }
    category = Category.includes(puzzles: [:puzzlesets]).find(params[:id])

    if category.nil?
      render json: {}, status: :not_found
    else
      response[:category] = category.as_json(
        except: %i[created_at updated_at],
        include: {
          puzzles: {
            except: %i[created_at updated_at],
            include: {
              puzzlesets: {
                only: [:id]
              }
            }
          }
        }
      )

      Puzzleset.all.each do |set|
        response[:puzzlesets].push(
          set.as_json(
            except: %i[created_at updated_at]
          )
        )
      end

      render json: response
    end
  end

  def export
    require 'json'
    category_data = MgmtServices::PuzzleServices::PuzzleExporter.call
    send_data(category_data.to_json, filename: 'categories.json', type: 'application/json')
  end

  def upload_json
    file_cont = params.require(:category_data).read

    error_strings = MgmtServices::PuzzleServices::PuzzleJSONImporter.call(file_cont)
    if error_strings.length > 0
      render json: { "errors": error_strings }, status: :bad_request
    else
      render json: {}
    end
  end

  def upload_csv
    file_cont = params.require(:category_data).read

    error_strings = MgmtServices::PuzzleServices::PuzzleCSVImporter.call(file_cont)
    if error_strings.length > 0
      render json: { "errors": error_strings }, status: :bad_request
    else
      render json: {}
    end
  end

  def create
    category = Category.new(name: params.require(:category).require(:name))

    if category.save
      render json: category
    else
      render json: category.errors, status: :bad_request
    end
  end

  def update
    category = Category.find(params.require(:id))

    if category.update(name: params.require(:category).require(:name))
      render json: {}
    else
      render json: {
        'status': 'error',
        'errors': category.errors
      }, status: :bad_request
    end
  end

  def destroy
    Category.find(params[:id]).destroy
    render json: { 'status': 'ok' }
  end
end
