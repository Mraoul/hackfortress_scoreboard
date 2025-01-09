# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_08_07_015014) do
  create_table "categories", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "games", charset: "utf8mb3", force: :cascade do |t|
    t.integer "singleton_guard", null: false
    t.integer "live_round_id"
    t.integer "ready_round_id"
    t.boolean "automated", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["singleton_guard"], name: "index_games_on_singleton_guard", unique: true
  end

  create_table "inventories", charset: "utf8mb3", force: :cascade do |t|
    t.integer "participant_id"
    t.integer "item_id"
    t.integer "quantity"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["item_id"], name: "index_inventories_on_item_id"
    t.index ["participant_id", "item_id"], name: "index_inventories_on_participant_id_and_item_id", unique: true
    t.index ["participant_id"], name: "index_inventories_on_participant_id"
  end

  create_table "item_groups", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "picture_location"
    t.boolean "discountable", default: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "hack_item", default: false
  end

  create_table "items", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.integer "cost"
    t.text "description"
    t.boolean "discountable", default: false
    t.integer "item_group_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "modifier", default: 0
    t.integer "players", default: 0
    t.integer "argument", default: 0
    t.integer "starting_quantity", default: 0
    t.string "friendly_text"
    t.string "effect_iden"
    t.boolean "is_buff", default: false
    t.index ["item_group_id"], name: "index_items_on_item_group_id"
  end

  create_table "participants", charset: "utf8mb3", force: :cascade do |t|
    t.integer "round_id"
    t.integer "team_id"
    t.integer "hack_score", default: 0
    t.integer "bonus_score", default: 0
    t.integer "tf2_score", default: 0
    t.integer "hackcoins", default: 0
    t.boolean "dominate", default: false
    t.integer "hints", default: 0
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "tf2coins", default: 0
    t.integer "store_status", default: 0
    t.integer "color", null: false
    t.index ["round_id"], name: "index_participants_on_round_id"
    t.index ["team_id"], name: "index_participants_on_team_id"
  end

  create_table "player_points", charset: "utf8mb3", force: :cascade do |t|
    t.integer "player_id"
    t.integer "round_id"
    t.integer "points"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "players", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.integer "team_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "purchases", charset: "utf8mb3", force: :cascade do |t|
    t.integer "participant_id"
    t.integer "item_id"
    t.integer "sale_ratio"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "puzzles", charset: "utf8mb3", force: :cascade do |t|
    t.text "description"
    t.integer "category_id"
    t.text "hints"
    t.string "name"
    t.string "data"
    t.string "solution"
    t.boolean "quickdraw", default: false
    t.boolean "fcfs", default: false
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "points", default: 0
    t.integer "unlock", default: 0
    t.string "author"
    t.integer "data_source", default: 0, null: false
    t.index ["category_id"], name: "index_puzzles_on_category_id"
  end

  create_table "puzzles_puzzlesets", id: false, charset: "utf8mb3", force: :cascade do |t|
    t.integer "puzzle_id"
    t.integer "puzzleset_id"
  end

  create_table "puzzlesets", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "rounds", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.integer "puzzleset_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "store_sale_ratio", default: 100
  end

  create_table "statuses", charset: "utf8mb3", force: :cascade do |t|
    t.integer "participant_id"
    t.integer "duration"
    t.integer "endtime"
    t.integer "status_type"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "submission_attempts", charset: "utf8mb3", force: :cascade do |t|
    t.integer "puzzle_id"
    t.integer "participant_id"
    t.integer "player_id"
    t.string "solution"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "submissions", charset: "utf8mb3", force: :cascade do |t|
    t.integer "participant_id"
    t.integer "puzzle_id"
    t.integer "value"
    t.integer "player_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "fdr", limit: 1
    t.index ["participant_id", "puzzle_id"], name: "index_submissions_on_participant_id_and_puzzle_id", unique: true
  end

  create_table "teams", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "users", charset: "utf8mb3", force: :cascade do |t|
    t.string "username"
    t.string "password"
    t.integer "team_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "role", limit: 1
  end

end
