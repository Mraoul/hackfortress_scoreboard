module Exceptions
  class StringLengthError < StandardError; end

  class InvalidItemError < StandardError; end

  class TeamMismatchError < StandardError; end

  class InvalidTeamError < StandardError; end

  class InvalidPuzzleError < StandardError; end

  class InvalidPlayerError < StandardError; end

  class RoundNotActiveError < StandardError; end

  class PuzzleSolvedError < StandardError; end

  class PuzzleSolvedOtherTeamError < StandardError; end

  class IncorrectSolutionError < StandardError; end

  class EmptySolutionError < StandardError; end

  class PermissionError < StandardError; end

  class NoStockError < StandardError; end

  class InsufficientFundsError < StandardError; end

  class CapBlockError < StandardError
    attr_accessor :time_remaining

    def initialize(message = nil, time_remaining = nil)
      super(message)
      self.time_remaining = time_remaining
    end
  end

  class CapDelayError < StandardError
    attr_accessor :delay

    def initialize(message = nil, delay = nil)
      super(message)
      self.delay = delay
    end
  end

  class StoreDownError < StandardError
    attr_accessor :time_remaining

    def initialize(message = nil, time_remaining = nil)
      super(message)
      self.time_remaining = time_remaining
    end
  end
end
