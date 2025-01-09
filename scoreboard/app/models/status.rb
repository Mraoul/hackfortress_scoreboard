class Status < ApplicationRecord
  belongs_to :participant

  Status_values = {
    'SMALL_HINT' => 1,
    'BIG_HINT' => 2,
    'CAP_DELAY' => 3,
    'CAP_BLOCK' => 4
  }.freeze

  Status_valuesR = Status_values.invert.freeze
  MAX_CAP_DELAY = 2
end
