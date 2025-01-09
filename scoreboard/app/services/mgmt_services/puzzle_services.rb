module MgmtServices::PuzzleServices
  class PuzzleExporter < ApplicationService
    def initialize; end

    def call
      output = []
      categories = Category.includes(puzzles: [:puzzlesets])
      categories.each do |category|
        category_hash = {}
        category_hash['Name'] = category.name
        category_hash['Puzzles'] = []
        category.puzzles.each do |puzzle|
          puzzle_hash = {
            'Name' => puzzle.name,
            'Description' => puzzle.description,
            'Hints' => puzzle.hints,
            'Points' => puzzle.points,
            'Location' => puzzle.data,
            'Download' => puzzle.data_source,
            'Solution' => puzzle.solution,
            'Unlock' => puzzle.unlock,
            'Author' => puzzle.author,
            'Set' => []
          }
          puzzle.puzzlesets.each do |ps|
            puzzle_hash['Set'].append(ps.id)
          end
          category_hash['Puzzles'].append(puzzle_hash)
        end
        output.append(category_hash)
      end
      { 'Categories' => output }
    end
  end

  class PuzzleJSONImporter < ApplicationService
    def initialize(raw_data)
      @raw_data = raw_data
    end

    def call
      error_strings = []
      begin
        require 'json'
        data = JSON.parse(@raw_data)
      rescue Exception => e
        error_strings.append(e.to_s)
        return error_strings
      end

      data = {} if data.nil?

      Rails.logger.info(data)

      if !data.has_key?('Categories')
        error_strings.append("Cannot find top level 'Categories' element")
      else
        unless data['Categories'].respond_to?('each')
          error_strings.append('Categories is expected to be an iterable')
          return error_strings
        end

        data['Categories'].each do |catg|
          next unless catg.has_key?('Name')

          catname = catg['Name']
          categories = Category.where(name: catname)
          category = nil
          if categories.length == 0 # doesn't exist
            # Need to create it
            category = Category.new(name: catname)
            unless category.save
              error_strings.append('Error Creating Category ' + catg)
              next
            end
          else # exists
            category = categories.first
          end

          catg['Puzzles'].each do |puz|
            puzzles = Puzzle.where(name: puz['Name'], category_id: category.id)
            puzzle = nil

            if puzzles.length == 0 # doesn't exist
              pid_arr = if !puz.has_key?('Set')
                          nil
                        else
                          puz['Set']
                        end

              data_source = if !puz.has_key?('Download')
                              'text_only'
                            elsif puz['Download'].downcase == 'gcloud'
                              'gcloud'
                            elsif puz['Download'].downcase == 'local'
                              'local'
                            else
                              'text_only'
                            end

              begin
                Rails.logger.debug(puz)
                puzzle = Puzzle.new(
                  category_id: category.id, name: puz['Name'],
                  description: puz['Description'], hints: puz['Hints'],
                  data: puz['Location'], solution: puz['Solution'], author: puz['Author'],
                  data_source: data_source,
                  points: puz['Points'].to_i, unlock: puz['Unlock'].to_i, puzzleset_ids: pid_arr
                )
              rescue StandardError => e
                error_strings.append('Error Instantiating Puzzle ' + puz['Name'])
              else
                begin
                  error_strings('Error Creating Puzzle ' + puz['Name']) unless puzzle.save
                rescue StandardError
                  error_strings.append('Error Saving Puzzle ' + puz['Name'])
                end
              end
            else # exists
              error_strings.append('Puzzle Name Already Exists -- Skipping: ' + puz['Name'])
            end
          end
        end
      end
      error_strings
    end
  end

  class PuzzleCSVImporter < ApplicationService
    def initialize(raw_csv)
      @raw_csv = raw_csv
    end

    def call
      error_strings = []

      begin
        require 'csv'
        data = CSV.parse(@raw_csv, headers: true)
      rescue Exception => e
        error_strings.append(e.to_s)
      end

      if data.nil?
        error_strings.push('No data found')
        return error_strings
      end

      expectedHeaders = %w[
        Category Name Set Hints
        Points Description Unlock Solution
        Location Author
      ].to_set

      headers = data.headers.to_set

      unless expectedHeaders.subset? headers
        inter = expectedHeaders.intersection(headers)
        missing = expectedHeaders - inter
        Rails.logger.error "Unable to process csv, missing: #{missing.to_a}"
        error_strings.append("Malformed header, required fields not found, #{missing.to_a}")
        return error_strings
      end

      data.each do |row|
        Rails.logger.debug(row.to_a)
        error_strings.push(*process_row(row))
      end
      error_strings
    end

    private def process_row(row)
      error_strings = []

      begin
        categoryName = row['Category'].rstrip
      rescue StandardError
        error_strings.append('No Category in csv - required field')
        return error_strings
      end

      begin
        puzzleName = row['Name'].rstrip
      rescue StandardError
        error_strings.append('Could not parse puzzle name, required field')
        return error_strings
      end

      category = Category.where(name: categoryName).first

      if category.nil?
        # Need to create it
        category = Category.new(name: categoryName)
        unless category.save
          error_strings.append('Error Creating Category ' + categoryName)
          category = nil
        end
      end

      return error_strings if category.nil?

      puzzle = Puzzle.where(name: puzzleName, category_id: category.id).first
      if puzzle.nil?
        pid_arr = if row['Set'].nil? or row['Set'].strip.empty?
                    []
                  else
                    [row['Set'].to_i]
                  end

        pid_arr.each do |pid|
          puzzleset = Puzzleset.where(id: pid).first
          if puzzleset.nil?
            error_strings.append("No Puzzleset with id #{pid}")
            return error_strings
          end
        end

        data_source = if row['Download'].nil? or row['Download'].strip.empty?
                        'text_only'
                      elsif row['Download'].downcase == 'gcloud'
                        'gcloud'
                      elsif row['Download'].downcase == 'local'
                        'local'
                      else
                        'text_only'
                      end

        psoln = if row['Solution'].nil? or row['Solution'].strip.empty?
                  ''
                else
                  row['Solution']
                end

        begin
          puzzle = Puzzle.new(
            category_id: category.id, name: puzzleName,
            description: row['Description'].to_s.strip, hints: row['Hints'].to_s.strip,
            data: row['Location'].to_s.strip, solution: psoln, author: row['Author'].to_s.strip,
            data_source: data_source,
            points: row['Points'].to_i, unlock: row['Unlock'].to_i, puzzleset_ids: pid_arr
          )
        rescue StandardError
          raise
          error_strings.append('Error Instantiating Puzzle ' + puzzleName)
        else
          begin
            error_strings.append('Error Creating Puzzle ' + puzzleName) unless puzzle.save
          rescue StandardError
            error_strings.append('Error Saving Puzzle ' + puzzleName)
          end
        end
      else # puzzle exists
        error_strings.append('Puzzle Name Already Exists -- Skipping: ' + puzzleName)
      end
      error_strings
    end
  end
end
