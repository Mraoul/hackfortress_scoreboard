# frozen_string_literal: true

module CtfServices
  SPECIAL_BONUSES = {
    first_blood: 15,
    domination: 15,
    revenge: 15
  }.freeze

  module TEAM_BONUS_STATUS
    NONE = 0
    DOMINATING = 1
    REVENGE = 2
    FIRST_BLOOD = 3
  end

  class PuzzleSubmitter < ApplicationService
    def initialize(
      participant, player, puzzle, round,
      solution, judge_submit
    )

      @participant = participant
      @player = player
      @puzzle = puzzle
      @round = round
      @solution = solution
      @judge_submit = judge_submit

      @remove_cap_delay = false
      @tf2coins_mod = 0
      @hack_score_mod = 0
      @bonus_score_mod = 0
      @delay_mod = 0

      @comms_queue = HFComms::Queue.new
      @redis_queue = RedisPublisher::Queue.new
      @submission = Submission.new
    end

    def call
      otherteam = false
      secondserved = false

      status = @participant.parse_statuses
      if status['CAP_BLOCK'] && !@judge_submit # Judges can override Cap Blocks
        raise Exceptions::CapBlockError.new('Cap Blocked', status['CAP_BLOCK'])
      end

      # Log every Submission that goes through this process
      unless @judge_submit
        begin
          SubmissionAttempt.create(
            player_id: @player.id, participant_id: @participant.id,
            puzzle_id: @puzzle.id, solution: @solution
          )
        rescue StandardError => e
          raise
        end
      end

      # First check if they solved it already or if other game conditions apply
      if @puzzle.quickdraw
        submit = Submission.where(
          '(participant_id = ? OR participant_id = ?) AND puzzle_id = ?',
          @round.participants[0].id, @round.participants[1].id, @puzzle.id
        )
        if !submit.empty? && submit.first.participant_id != @participant.id # the other team solved it :)
          otherteam = true
        end
      # FCFS code
      # elsif @puzzle.fcfs
      #     submit = Submission.where(
      #       "(participant_id = ? OR participant_id = ?) AND puzzle_id = ?",
      #       @round.participants[0].id, @round.participants[1].id, @puzzle.id)
      #     if ((!submit.empty?) && (submit.first.participant_id != @participant.id))
      #       # the other team solved it :)
      #       secondserved = true
      #     end

      #     if ((submit.length == 1) && (submit.first.participant_id != @participant.id))
      #       # only the other team solved it
      #       # reset the variable so it doesn't think they solved it
      #       submit = Array.new()
      #     end
      else
        submit = Submission.where(participant_id: @participant.id, puzzle_id: @puzzle.id)
      end

      # Puzzle already solved
      unless submit.empty?
        raise Exceptions::PuzzleSolvedOtherTeamError if otherteam

        raise Exceptions::PuzzleSolvedError

      end

      real_soln = @puzzle.solution # get the real solution to the puzzle

      raise Exceptions::IncorrectSolutionError if !@judge_submit && real_soln.downcase != @solution.downcase

      if status['CAP_DELAY']
        @delay_mod = status['CAP_DELAY']
        @remove_cap_delay = true
      end

      @submission.participant_id = @participant.id
      @submission.puzzle_id = @puzzle.id
      @submission.value = @puzzle.points
      @submission.player_id = @player.id

      # FCFS XXX
      # if @puzzle.fcfs && secondserved#First Come, First Served
      #     @submission.value = @submission.value / 2
      # end

      @hack_score_mod += @submission.value
      @tf2coins_mod += @puzzle.points

      handle_bonus_status
      queue_messages

      # TODO: add double error-checking to make sure these save
      Submission.transaction do
        if @submission.save
          GameServices::CapDelayRemover.call(@participant) if @remove_cap_delay

          @participant.with_lock do
            @participant.hack_score += @hack_score_mod
            @participant.bonus_score += @bonus_score_mod
            @participant.tf2coins += @tf2coins_mod
            @participant.save
          end

          playerpoint = PlayerPoint.create(
            player_id: @player.id, round_id: @round.id, points: @submission.value
          )

        else
          Rails.logger.error("Error Saving Submission #{@submission.errors}")
          raise 'Unable to save submission'
        end
      end

      @comms_queue.send
      @redis_queue.send

      [@submission, @delay_mod]
    end

    private

    def check_domination(last_submission, _other_participant)
      if last_submission.participant == @participant
        @participant.dominate = true
        @participant.save
        return TEAM_BONUS_STATUS::DOMINATING
      end
      TEAM_BONUS_STATUS::NONE
    end

    def check_revenge(last_submission, other_participant)
      # Clear domination flag
      other_participant.dominate = false
      other_participant.save

      # If submitting a puzzle within 60 seconds of other team dominating
      return TEAM_BONUS_STATUS::REVENGE if (Time.now.to_i - last_submission.created_at.to_i) < 60

      TEAM_BONUS_STATUS::NONE
    end

    def check_bonus_status
      return TEAM_BONUS_STATUS::FIRST_BLOOD if @round.submissions.count < 1
      # Team is already dominating
      return TEAM_BONUS_STATUS::NONE if @participant.dominate

      other_participant = @round.other_participant(@participant)
      last_submission = @round.submissions.where(participant_id: [@participant.id,
                                                                  other_participant.id]).order(:id).last
      return TEAM_BONUS_STATUS::NONE if last_submission.nil?
      return check_revenge(last_submission, other_participant) if other_participant.dominate

      check_domination(last_submission, other_participant)
    end

    def handle_bonus_status
      bonus_status = check_bonus_status

      case bonus_status
      when TEAM_BONUS_STATUS::FIRST_BLOOD
        @submission.fdr = 'f'

        fb_diff = SPECIAL_BONUSES[:first_blood]
        @bonus_score_mod += fb_diff
        @tf2coins_mod += fb_diff

        @comms_queue.queue_hack_event(
          HFComms::BonusEventMessage.new(
            @participant.team_number,
            'first_blood',
            fb_diff
          ),
          3 # delay of 3 seconds
        )
      when TEAM_BONUS_STATUS::DOMINATING
        @submission.fdr = 'd'

        d_diff = SPECIAL_BONUSES[:domination]
        @bonus_score_mod += d_diff
        @tf2coins_mod += d_diff

        @comms_queue.queue_hack_event(
          HFComms::BonusEventMessage.new(
            @participant.team_number,
            'domination',
            d_diff
          ),
          3 # delay of 3 seconds
        )
      when TEAM_BONUS_STATUS::REVENGE
        @submission.fdr = 'r'

        r_diff = SPECIAL_BONUSES[:revenge]
        @bonus_score_mod += r_diff
        @tf2coins_mod += r_diff

        @comms_queue.queue_hack_event(
          HFComms::BonusEventMessage.new(
            @participant.team_number,
            'revenge',
            r_diff
          ),
          3 # delay of 3 seconds
        )
        # when TEAM_BONUS_STATUS::NONE
      end
    end

    def queue_messages
      @redis_queue.queue_update_to(
        @participant.color,
        RedisPublisher::SolvedMessage.new(
          @puzzle.id, @player.name
        )
      )

      @comms_queue.queue_hack_event(
        HFComms::HackEventMessage.new(
          @participant.team_number,
          @puzzle.category.name,
          @puzzle.name,
          @submission.value,
          @player.name == 'Team Effort' ? 'team_effort' : @player.name
        )
      )

      if @hack_score_mod > 0
        @redis_queue.queue_dashboard_update_to(
          @participant.color,
          RedisPublisher::UpdateHackScoreMessage.new(
            @hack_score_mod
          )
        )
      end

      return unless @bonus_score_mod > 0

      @redis_queue.queue_dashboard_update_to(
        @participant.color,
        RedisPublisher::UpdateBonusScoreMessage.new(
          @bonus_score_mod
        )
      )
    end
  end
end
