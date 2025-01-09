# frozen_string_literal: true

require 'test_helper'

class PuzzleServicesTest < ActionDispatch::IntegrationTest
  setup do
  end
  test 'puzzles export' do
    exported = MgmtServices::PuzzleServices::PuzzleExporter.call
    assert exported['Categories'].length.positive?

    exportedCategory = exported['Categories'][0]

    assert_includes exportedCategory, 'Name'
    assert_includes exportedCategory, 'Puzzles'
    assert exportedCategory['Puzzles'].length.positive?

    exportedItem = exportedCategory['Puzzles'][0]
    assert_includes exportedItem, 'Name'
    assert_includes exportedItem, 'Description'
    assert_includes exportedItem, 'Hints'
    assert_includes exportedItem, 'Points'
    assert_includes exportedItem, 'Location'
    assert_includes exportedItem, 'Download'
    assert_includes exportedItem, 'Solution'
    assert_includes exportedItem, 'Unlock'
    assert_includes exportedItem, 'Author'
    assert_includes exportedItem, 'Set'
  end

  test 'puzzles import json' do
    exported = MgmtServices::PuzzleServices::PuzzleExporter.call
    puzzleCount = Puzzle.count
    Category.destroy_all
    assert Category.all.length.zero?
    MgmtServices::PuzzleServices::PuzzleJSONImporter.call(JSON.dump(exported))
    assert Category.all.length.positive?
    assert_equal Puzzle.count, puzzleCount
  end

  test 'puzzles import json dups' do
    exported = MgmtServices::PuzzleServices::PuzzleExporter.call
    exported = { 'Categories' => exported['Categories'].push(*exported['Categories']) }
    Category.destroy_all
    errors = MgmtServices::PuzzleServices::PuzzleJSONImporter.call(JSON.dump(exported))
    assert Category.all.length.positive?
    assert errors.length.positive?
  end

  test 'puzzles import csv' do
    puzzleset = puzzlesets(:puzzleset1)
    incsv =
      <<~EOC.gsub(/^\s+\|/, '')
        Name,Category,Set,Points,Solution,Hints,Description,Unlock,Location,GitlabURL,Docker,DockerPorts,Author,IP Address (if applicapable),Status,New or Old,VirtualHost,Download,,Backup Points
        RE101,Data Exploitation,#{puzzleset.id},35,testsolution,Test Hints,"Submit without ""flag{}""",,/re1.bin,,,,Author1/Author2,,,Old,,local,25,50
        RE102,Potent Potables,,50,testsolution,Test Hints,"Submit without ""flag{}""",,/re2.bin,,,,Author1/Author2,,,,,local,35,75
        Social Eng 1,Information Operations,,55,,Judge Submit,"Desc",5,x5000 (Phone),,,,All,,,Old,,,35,80
        Bribe 1,Information Operations,,35,,,Bribe the judges.,20,,,,,All,,Done,Old,,,25,50
        Donate 1,Information Operations,,35,,,Description,20,,,,,All,,Done,Old,,,25,50
      EOC

    errors = MgmtServices::PuzzleServices::PuzzleCSVImporter.call(incsv)
    assert errors.length.zero?
    assert_not Category.where(name: 'Information Operations').first.nil?
    assert_not Puzzle.where(name: 'RE101').first.nil?
  end

  test 'puzzles import csv required column missing' do
    incsv =
      <<~EOC.gsub(/^\s+\|/, '')
        Foo,Category,Set,Points,Solution,Hints,Description,Unlock,Location,GitlabURL,Docker,DockerPorts,Author,IP Address (if applicapable),Status,New or Old,VirtualHost,Download,,Backup Points
        RE101,Data Exploitation,,35,testsolution,Test Hints,"Submit without ""flag{}""",,/re1.bin,,,,Author1/Author2,,,Old,,local,25,50
        RE102,Potent Potables,,50,testsolution,Test Hints,"Submit without ""flag{}""",,/re2.bin,,,,Author1/Author2,,,,,local,35,75
        Social Eng 1,Information Operations,,55,,Judge Submit,"Desc",5,x5000 (Phone),,,,All,,,Old,,,35,80
        Bribe 1,Information Operations,,35,,,Bribe the judges.,20,,,,,All,,Done,Old,,,25,50
        Donate 1,Information Operations,,35,,,Description,20,,,,,All,,Done,Old,,,25,50
      EOC

    errors = MgmtServices::PuzzleServices::PuzzleCSVImporter.call(incsv)
    assert errors.length == 1
  end

  test 'puzzles import csv puzzle missing name' do
    incsv =
      <<~EOC.gsub(/^\s+\|/, '')
        Name,Category,Set,Points,Solution,Hints,Description,Unlock,Location,GitlabURL,Docker,DockerPorts,Author,IP Address (if applicapable),Status,New or Old,VirtualHost,Download,,Backup Points
        ,Data Exploitation,,35,testsolution,Test Hints,"Submit without ""flag{}""",,/re1.bin,,,,Author1/Author2,,,Old,,local,25,50
        RE102,Potent Potables,,50,testsolution,Test Hints,"Submit without ""flag{}""",,/re2.bin,,,,Author1/Author2,,,,,local,35,75
        Social Eng 1,Information Operations,,55,,Judge Submit,"Desc",5,x5000 (Phone),,,,All,,,Old,,,35,80
        Bribe 1,Information Operations,,35,,,Bribe the judges.,20,,,,,All,,Done,Old,,,25,50
        Donate 1,Information Operations,,35,,,Description,20,,,,,All,,Done,Old,,,25,50
      EOC

    errors = MgmtServices::PuzzleServices::PuzzleCSVImporter.call(incsv)
    assert errors.length == 1
    assert Puzzle.where(name: 'RE101').first.nil?
  end

  test 'puzzles import csv puzzle missing category' do
    incsv =
      <<~EOC.gsub(/^\s+\|/, '')
        Name,Category,Set,Points,Solution,Hints,Description,Unlock,Location,GitlabURL,Docker,DockerPorts,Author,IP Address (if applicapable),Status,New or Old,VirtualHost,Download,,Backup Points
        RE101,,,35,testsolution,Test Hints,"Submit without ""flag{}""",,/re1.bin,,,,Author1/Author2,,,Old,,local,25,50
        RE102,Potent Potables,,50,testsolution,Test Hints,"Submit without ""flag{}""",,/re2.bin,,,,Author1/Author2,,,,,local,35,75
        Social Eng 1,Information Operations,,55,,Judge Submit,"Desc",5,x5000 (Phone),,,,All,,,Old,,,35,80
        Bribe 1,Information Operations,,35,,,Bribe the judges.,20,,,,,All,,Done,Old,,,25,50
        Donate 1,Information Operations,,35,,,Description,20,,,,,All,,Done,Old,,,25,50
      EOC

    errors = MgmtServices::PuzzleServices::PuzzleCSVImporter.call(incsv)
    assert errors.length == 1
    assert Puzzle.where(name: 'RE101').first.nil?
  end

  test 'puzzles import csv puzzle nonexitant puzzleset' do
    incsv =
      <<~EOC.gsub(/^\s+\|/, '')
        Name,Category,Set,Points,Solution,Hints,Description,Unlock,Location,GitlabURL,Docker,DockerPorts,Author,IP Address (if applicapable),Status,New or Old,VirtualHost,Download,,Backup Points
        RE101,Data Exploitation,1,35,testsolution,Test Hints,"Submit without ""flag{}""",,/re1.bin,,,,Author1/Author2,,,Old,,local,25,50
        RE102,Potent Potables,,50,testsolution,Test Hints,"Submit without ""flag{}""",,/re2.bin,,,,Author1/Author2,,,,,local,35,75
        Social Eng 1,Information Operations,,55,,Judge Submit,"Desc",5,x5000 (Phone),,,,All,,,Old,,,35,80
        Bribe 1,Information Operations,,35,,,Bribe the judges.,20,,,,,All,,Done,Old,,,25,50
        Donate 1,Information Operations,,35,,,Description,20,,,,,All,,Done,Old,,,25,50
      EOC

    errors = MgmtServices::PuzzleServices::PuzzleCSVImporter.call(incsv)
    assert errors.length == 1
    assert Puzzle.where(name: 'RE101').first.nil?
  end

  test 'puzzles import csv puzzle duplicate' do
    incsv =
      <<~EOC.gsub(/^\s+\|/, '')
        Name,Category,Set,Points,Solution,Hints,Description,Unlock,Location,GitlabURL,Docker,DockerPorts,Author,IP Address (if applicapable),Status,New or Old,VirtualHost,Download,,Backup Points
        RE101,Data Exploitation,,35,testsolution,Test Hints,"Submit without ""flag{}""",,/re1.bin,,,,Author1/Author2,,,Old,,local,25,50
        RE101,Data Exploitation,,35,testsolution,Test Hints,"Submit without ""flag{}""",,/re1.bin,,,,Author1/Author2,,,Old,,local,25,50
        RE102,Potent Potables,,50,testsolution,Test Hints,"Submit without ""flag{}""",,/re2.bin,,,,Author1/Author2,,,,,local,35,75
        Social Eng 1,Information Operations,,55,,Judge Submit,"Desc",5,x5000 (Phone),,,,All,,,Old,,,35,80
        Bribe 1,Information Operations,,35,,,Bribe the judges.,20,,,,,All,,Done,Old,,,25,50
        Donate 1,Information Operations,,35,,,Description,20,,,,,All,,Done,Old,,,25,50
      EOC

    errors = MgmtServices::PuzzleServices::PuzzleCSVImporter.call(incsv)
    assert errors.length == 1
    assert_not Category.where(name: 'Information Operations').first.nil?
    assert_not Puzzle.where(name: 'RE101').first.nil?
  end
end
